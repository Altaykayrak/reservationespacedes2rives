
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useEffect } from "react";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";

export const useHolidaySpots = (
  periodId: string,
  date: Date,
  childSchoolClass: string
) => {
  const queryClient = useQueryClient();
  const normalizedClass = normalizeSchoolClass(childSchoolClass);

  // Logging spécifique pour le debug du Club Ado
  console.log(`useHolidaySpots - Input: Class=${childSchoolClass}, Normalized=${normalizedClass}, Date=${format(date, "yyyy-MM-dd")}, PeriodId=${periodId}`);

  useEffect(() => {
    const channel = supabase
      .channel('holiday-spots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'holiday_reservations'
        },
        (payload) => {
          console.log("Holiday reservation change detected:", payload);
          queryClient.invalidateQueries({
            queryKey: ["spots_left", periodId, date.toISOString(), normalizedClass]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, periodId, date, normalizedClass]);

  return useQuery({
    queryKey: ["spots_left", periodId, date.toISOString(), normalizedClass],
    queryFn: async () => {
      if (!normalizedClass) {
        console.error("Classe scolaire manquante");
        return null;
      }

      if (!periodId) {
        console.error("Period ID manquant");
        return null;
      }

      const formattedDate = format(date, 'yyyy-MM-dd');
      
      try {
        // 1. Récupérer les informations sur la période
        const { data: periodData, error: periodError } = await supabase
          .from('available_holiday_periods')
          .select(`
            id,
            name,
            max_participants_kindergarten,
            max_participants_primary,
            max_participants_teen
          `)
          .eq('id', periodId)
          .maybeSingle();

        if (periodError) {
          console.error("Erreur lors de la récupération des données de période:", periodError);
          if (periodError.code === 'PGRST116') {
            console.log("Période non trouvée, retour null");
            return null;
          }
          throw periodError;
        }
        
        if (!periodData) {
          console.log("Aucune donnée de période trouvée pour", periodId);
          return null;
        }

        // 2. Traitement spécial pour CM2 pendant les périodes d'été
        const summerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04"];
        let classCategory = '';
        let classGroup = '';
        
        // Vérifier si c'est un CM2 et une période d'été spéciale (ETE-01 à ETE-04)
        if (normalizedClass === "CM2" && periodData.name && summerPeriods.includes(periodData.name)) {
          console.log(`Période d'été spéciale détectée pour CM2: ${periodData.name}, traité comme adolescent`);
          classCategory = 'adolescent';
          classGroup = 'teen';
        } else {
          // 3. Sinon, récupérer le mapping spécifique
          const { data: mappings } = await supabase
            .from("holiday_period_class_mappings")
            .select("category, school_class, holiday_period_id");
            
          console.log("Mappings de classe trouvés:", mappings?.length);
          
          const mapping = mappings?.find(m => 
            m.holiday_period_id === periodId && 
            m.school_class.toUpperCase() === normalizedClass.toUpperCase()
          );
            
          if (mapping) {
            // Si la classe est dans la catégorie "aucune", il n'y a pas de places disponibles
            if (mapping.category === "aucune") {
              console.log(`La classe ${normalizedClass} n'est pas disponible pour cette période (catégorie: aucune)`);
              return 0;
            }
            classCategory = mapping.category;
          } else {
            // Utiliser la catégorisation par défaut
            if (['PS', 'MS', 'GS'].includes(normalizedClass)) {
              classCategory = 'maternelle';
            } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedClass)) {
              classCategory = 'primaire';
            } else {
              classCategory = 'adolescent';
            }
          }
          
          // Convertir la catégorie en groupe interne
          if (classCategory === 'maternelle') classGroup = 'kindergarten';
          else if (classCategory === 'primaire') classGroup = 'primary';
          else if (classCategory === 'adolescent') classGroup = 'teen';
        }
        
        console.log(`Classe ${normalizedClass} a été mappée au groupe ${classGroup} (catégorie: ${classCategory})`);

        if (!classGroup) {
          console.log(`Pas de groupe valide trouvé pour la classe ${normalizedClass}`);
          return null;
        }
        
        // 4. Récupérer le maximum de places pour ce groupe
        const maxSpots = periodData[`max_participants_${classGroup}`] || 0;
        
        if (maxSpots === 0) {
          console.log(`Pas de places configurées pour le groupe ${classGroup}`);
          return 0;
        }

        // 5. Récupérer les réservations pour cette date et période
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('holiday_reservations')
          .select('id, child_id, child:children(school_class)')
          .eq('period_id', periodId)
          .eq('reservation_date', formattedDate)
          .eq('status', 'confirmed');

        if (reservationsError) {
          console.error("Erreur lors de la récupération des réservations:", reservationsError);
          throw reservationsError;
        }

        // 6. Compter les réservations pour le même groupe
        let reservationsCount = 0;
        
        for (const res of reservationsData) {
          const childClass = res.child?.school_class;
          if (!childClass) continue;
          
          const normalizedChildClass = normalizeSchoolClass(childClass);
          let resClassGroup = '';
          
          // Appliquer le même traitement spécial pour les CM2 dans les périodes d'été
          if (normalizedChildClass === "CM2" && periodData.name && summerPeriods.includes(periodData.name)) {
            resClassGroup = 'teen';
          } else {
            // Vérifier le mapping spécifique pour cet enfant
            const childMapping = mappings?.find(m => 
              m.holiday_period_id === periodId && 
              m.school_class.toUpperCase() === normalizedChildClass.toUpperCase()
            );
              
            let resClassCategory = '';
            if (childMapping) {
              resClassCategory = childMapping.category;
            } else {
              // Catégorie par défaut
              if (['PS', 'MS', 'GS'].includes(normalizedChildClass)) {
                resClassCategory = 'maternelle';
              } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedChildClass)) {
                resClassCategory = 'primaire';
              } else {
                resClassCategory = 'adolescent';
              }
            }
            
            // Convertir en groupe
            if (resClassCategory === 'maternelle') resClassGroup = 'kindergarten';
            else if (resClassCategory === 'primaire') resClassGroup = 'primary';
            else if (resClassCategory === 'adolescent') resClassGroup = 'teen';
          }
          
          // Compter seulement si c'est le même groupe
          if (resClassGroup === classGroup) {
            reservationsCount++;
          }
        }
        
        // 7. Calculer les places restantes
        const spotsLeft = maxSpots - reservationsCount;
        
        console.log(`Résultat du calcul pour ${normalizedClass} le ${formattedDate}: max=${maxSpots}, réservations=${reservationsCount}, restantes=${spotsLeft}, groupe=${classGroup}, catégorie=${classCategory}`);
        
        return Math.max(0, spotsLeft);
        
      } catch (error) {
        console.error("Erreur lors de la vérification des places:", error);
        return null;
      }
    },
    enabled: Boolean(periodId) && Boolean(normalizedClass),
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
};
