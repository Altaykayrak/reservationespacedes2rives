
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
        // 1. Vérifier d'abord si cette classe a une catégorie spécifique pour cette période
        const { data: mapping, error: mappingError } = await supabase
          .from("holiday_period_class_mappings")
          .select("category")
          .eq("holiday_period_id", periodId)
          .eq("school_class", normalizedClass)
          .maybeSingle();
          
        if (mappingError && mappingError.code !== 'PGRST116') {
          console.error("Erreur lors de la vérification du mapping de classe:", mappingError);
        }
          
        // Si la classe est dans la catégorie "aucune", il n'y a pas de places disponibles
        if (mapping && mapping.category === "aucune") {
          console.log(`La classe ${normalizedClass} n'est pas disponible pour cette période (catégorie: aucune)`);
          return 0;
        }

        // 2. Récupérer d'abord les informations sur la période
        const { data: periodData, error: periodError } = await supabase
          .from('available_holiday_periods')
          .select(`
            id,
            max_participants_kindergarten,
            max_participants_primary,
            max_participants_teen
          `)
          .eq('id', periodId)
          .maybeSingle();

        if (periodError) {
          console.error("Erreur lors de la récupération des données de période:", periodError);
          if (periodError.code === 'PGRST116') {
            // Si la période n'existe pas, on retourne null plutôt que de laisser l'erreur se propager
            console.log("Période non trouvée, retour null");
            return null;
          }
          throw periodError;
        }
        
        if (!periodData) {
          console.log("Aucune donnée de période trouvée pour", periodId);
          return null;
        }

        // 3. Récupérer tous les mappings pour cette période
        const { data: mappingsData } = await supabase
          .from('holiday_period_class_mappings')
          .select('school_class, category')
          .eq('holiday_period_id', periodId);
          
        const classMappings = mappingsData || [];
        console.log("Mappings de classe trouvés:", classMappings.length);
        
        // 4. Déterminer la catégorie de cette classe (avec ou sans mapping)
        let classCategory = '';
        const specificMapping = classMappings.find(m => 
          m.school_class.toLowerCase() === normalizedClass.toLowerCase()
        );
        
        if (specificMapping) {
          classCategory = specificMapping.category;
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
        
        // 5. Convertir la catégorie en groupe interne
        let classGroup = '';
        if (classCategory === 'maternelle') classGroup = 'kindergarten';
        else if (classCategory === 'primaire') classGroup = 'primary';
        else if (classCategory === 'adolescent') classGroup = 'teen';
        
        console.log(`Classe ${normalizedClass} a été mappée au groupe ${classGroup} (catégorie: ${classCategory})`);

        if (!classGroup) {
          console.log(`Pas de groupe valide trouvé pour la classe ${normalizedClass}`);
          return null;
        }
        
        // 6. Récupérer le maximum de places pour ce groupe
        const maxSpots = periodData[`max_participants_${classGroup}`] || 0;
        
        if (maxSpots === 0) {
          console.log(`Pas de places configurées pour le groupe ${classGroup}`);
          return 0;
        }

        // 7. Récupérer les réservations pour cette date et période
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

        // 8. Filtrer les réservations pour le même groupe, en tenant compte des mappings
        let reservationsCount = 0;
        
        for (const res of reservationsData) {
          const childClass = res.child?.school_class;
          if (!childClass) continue;
          
          const normalizedChildClass = normalizeSchoolClass(childClass);
          
          // Déterminer la catégorie de la classe de l'enfant
          let resClassCategory = '';
          const resMapping = classMappings.find(m => 
            m.school_class.toLowerCase() === normalizedChildClass.toLowerCase()
          );
          
          if (resMapping) {
            resClassCategory = resMapping.category;
          } else {
            // Utiliser la catégorisation par défaut
            if (['PS', 'MS', 'GS'].includes(normalizedChildClass)) {
              resClassCategory = 'maternelle';
            } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedChildClass)) {
              resClassCategory = 'primaire';
            } else {
              resClassCategory = 'adolescent';
            }
          }
          
          // Convertir en groupe interne
          let resClassGroup = '';
          if (resClassCategory === 'maternelle') resClassGroup = 'kindergarten';
          else if (resClassCategory === 'primaire') resClassGroup = 'primary';
          else if (resClassCategory === 'adolescent') resClassGroup = 'teen';
          
          // Compter seulement si c'est le même groupe
          if (resClassGroup === classGroup) {
            reservationsCount++;
          }
        }
        
        // 9. Calculer les places restantes
        const spotsLeft = maxSpots - reservationsCount;
        
        console.log(`Résultat du calcul pour ${normalizedClass} le ${formattedDate}: max=${maxSpots}, réservations=${reservationsCount}, restantes=${spotsLeft}, groupe=${classGroup}, catégorie=${classCategory}`);
        
        return Math.max(0, spotsLeft); // Ne jamais retourner de valeur négative
        
      } catch (error) {
        console.error("Erreur lors de la vérification des places:", error);
        return null; // En cas d'erreur, on retourne null pour indiquer qu'on ne sait pas
      }
    },
    enabled: Boolean(periodId) && Boolean(normalizedClass),
    retry: 1,
    retryDelay: 1000,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
};
