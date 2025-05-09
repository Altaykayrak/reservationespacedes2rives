
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
        // Vérifier d'abord si cette classe a une catégorie pour cette période
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
      } catch (error) {
        console.error("Erreur lors de la vérification du mapping de classe:", error);
      }
      
      console.log("Appel à check_holiday_spots_available avec:", {
        period_id: periodId,
        reservation_date: formattedDate,
        child_school_class: normalizedClass
      });

      try {
        // Déterminer le groupe de classe de l'enfant
        let classGroup = '';
        if (['PS', 'MS', 'GS'].includes(normalizedClass)) {
          classGroup = 'kindergarten';
        } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedClass)) {
          classGroup = 'primary';
        } else {
          classGroup = 'teen';
        }

        // 1. Récupérer d'abord les informations sur la période
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
        
        // Récupérer le maximum de places pour ce groupe
        const maxSpots = periodData[`max_participants_${classGroup}`] || 0;
        
        // 2. Ensuite, récupérer les réservations pour cette date et période
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

        // 3. Vérifier si on a besoin d'utiliser les mappings de classe spéciaux
        const { data: mappingsData } = await supabase
          .from('holiday_period_class_mappings')
          .select('school_class, category')
          .eq('holiday_period_id', periodId);
          
        const mappings = mappingsData || [];
        console.log("Mappings de classe trouvés:", mappings.length);

        // Fonction pour déterminer le groupe d'une classe avec mappings
        const getClassGroupWithMapping = (schoolClass: string): string => {
          // Chercher un mapping spécifique
          const mapping = mappings.find(m => 
            m.school_class.toLowerCase() === schoolClass.toLowerCase()
          );
          
          if (mapping) {
            // Si un mapping est trouvé, convertir sa catégorie en groupe interne
            if (mapping.category === 'maternelle') return 'kindergarten';
            if (mapping.category === 'primaire') return 'primary';
            if (mapping.category === 'adolescent') return 'teen';
            return '';
          }
          
          // Groupes par défaut si pas de mapping
          if (['PS', 'MS', 'GS'].includes(schoolClass)) return 'kindergarten';
          if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(schoolClass)) return 'primary';
          return 'teen';
        };

        // Filtrer les réservations par groupe de classe avec mappings
        const reservationsCount = reservationsData.filter(res => {
          const childClass = res.child?.school_class;
          if (!childClass) return false;
          
          const normalizedChildClass = normalizeSchoolClass(childClass);
          const resClassGroup = getClassGroupWithMapping(normalizedChildClass);
          
          // Compter seulement les réservations du même groupe
          return resClassGroup === getClassGroupWithMapping(normalizedClass);
        }).length;
        
        // Calculer les places restantes
        const spotsLeft = maxSpots - reservationsCount;
        
        console.log(`Résultat du calcul pour ${normalizedClass} le ${formattedDate}: max=${maxSpots}, réservations=${reservationsCount}, restantes=${spotsLeft}, groupe=${getClassGroupWithMapping(normalizedClass)}`);
        
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
