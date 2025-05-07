
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
      
      // Vérifier d'abord si cette classe a une catégorie pour cette période
      try {
        const { data: mapping, error: mappingError } = await supabase
          .from("holiday_period_class_mappings")
          .select("category")
          .eq("holiday_period_id", periodId)
          .eq("school_class", normalizedClass)
          .maybeSingle();
          
        if (mappingError) {
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
        // Utilisation de SQL natif au lieu de la fonction RPC pour éviter l'ambiguïté
        const { data, error } = await supabase
          .from('available_holiday_periods')
          .select(`
            id,
            max_participants_kindergarten,
            max_participants_primary,
            max_participants_teen,
            reservations:holiday_reservations!inner(
              id,
              child:children(school_class)
            )
          `)
          .eq('id', periodId)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération des données de période:", error);
          throw error;
        }
        
        // Déterminer le groupe de classe de l'enfant
        let classGroup = '';
        if (['PS', 'MS', 'GS'].includes(normalizedClass)) {
          classGroup = 'kindergarten';
        } else if (['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedClass)) {
          classGroup = 'primary';
        } else {
          classGroup = 'teen';
        }
        
        // Récupérer le maximum de places pour ce groupe
        const maxSpots = data[`max_participants_${classGroup}`] || 0;
        
        // Obtenir toutes les réservations pour cette date
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

        // Filtrer les réservations par groupe de classe
        const reservationsCount = reservationsData.filter(res => {
          const childClass = res.child?.school_class;
          if (!childClass) return false;
          
          const normalizedChildClass = normalizeSchoolClass(childClass);
          
          if (classGroup === 'kindergarten') {
            return ['PS', 'MS', 'GS'].includes(normalizedChildClass);
          } else if (classGroup === 'primary') {
            return ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedChildClass);
          } else {
            return !['PS', 'MS', 'GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(normalizedChildClass);
          }
        }).length;
        
        // Calculer les places restantes
        const spotsLeft = maxSpots - reservationsCount;
        
        console.log(`Résultat du calcul pour ${normalizedClass} le ${formattedDate}: max=${maxSpots}, réservations=${reservationsCount}, restantes=${spotsLeft}`);
        
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
