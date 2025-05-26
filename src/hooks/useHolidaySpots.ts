
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString().split('T')[0], schoolClass],
    queryFn: async () => {
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("🔍 useHolidaySpots - Paramètres invalides:", { periodId, date, schoolClass });
        return null;
      }

      try {
        const dateStr = date.toISOString().split('T')[0];
        
        console.log("🔄 useHolidaySpots - Calcul des places disponibles pour:", {
          periodId,
          date: dateStr,
          schoolClass
        });

        // 1. D'abord, récupérer les informations de la période
        const { data: periodData, error: periodError } = await supabase
          .from("available_holiday_periods")
          .select("max_participants_kindergarten, max_participants_primary, max_participants_teen")
          .eq("id", periodId)
          .single();

        if (periodError) {
          console.error("❌ Erreur lors de la récupération de la période:", periodError);
          toast.error("Erreur lors de la récupération de la période");
          return null;
        }

        // 2. Déterminer le groupe de la classe (utiliser la fonction RPC pour avoir la même logique)
        const { data: classGroup, error: groupError } = await supabase.rpc(
          'get_school_class_group_for_period',
          {
            p_period_id: periodId,
            p_school_class: schoolClass
          }
        );

        if (groupError) {
          console.error("❌ Erreur lors de la détermination du groupe:", groupError);
          // Fallback sur la logique locale
          let group = 'primary';
          const normalizedClass = schoolClass.toUpperCase();
          if (['PS', 'MS'].includes(normalizedClass)) {
            group = 'kindergarten';
          } else if (['GS', 'CP', 'CE1', 'CE2', 'CM1'].includes(normalizedClass)) {
            group = 'primary';
          } else if (normalizedClass === 'CM2') {
            // Vérifier si c'est une période d'été
            const { data: periodInfo } = await supabase
              .from("available_holiday_periods")
              .select("name")
              .eq("id", periodId)
              .single();
            
            if (periodInfo && ['ETE-01', 'ETE-02', 'ETE-03', 'ETE-04'].includes(periodInfo.name)) {
              group = 'teen';
            } else {
              group = 'primary';
            }
          } else if (['6ÈME', '6EME', '5ÈME', '5EME', '4ÈME', '4EME', '3ÈME', '3EME', 'SECONDE', 'PREMIÈRE', 'PREMIERE', 'TERMINALE'].includes(normalizedClass)) {
            group = 'teen';
          }
          console.log("🔧 Groupe déterminé par fallback:", group);
        } else {
          console.log("✅ Groupe déterminé par RPC:", classGroup);
        }

        const finalGroup = classGroup || 'primary';

        // 3. Récupérer la capacité selon le groupe
        let capacity = 0;
        if (finalGroup === 'kindergarten') {
          capacity = periodData.max_participants_kindergarten;
        } else if (finalGroup === 'primary') {
          capacity = periodData.max_participants_primary;
        } else if (finalGroup === 'teen') {
          capacity = periodData.max_participants_teen;
        }

        console.log("📦 Capacité pour le groupe", finalGroup, ":", capacity);

        // 4. Compter toutes les réservations confirmées du même groupe pour cette date
        // Utiliser la vue pour avoir accès aux informations des enfants
        const { data: reservations, error: reservationsError } = await supabase
          .from("holiday_reservations_with_children")
          .select("*")
          .eq("period_id", periodId)
          .eq("reservation_date", dateStr)
          .eq("status", "confirmed");

        if (reservationsError) {
          console.error("❌ Erreur lors de la récupération des réservations:", reservationsError);
          toast.error("Erreur lors de la récupération des réservations");
          return null;
        }

        // 5. Filtrer les réservations pour ne garder que celles du même groupe
        let sameGroupReservations = 0;
        
        if (reservations) {
          for (const reservation of reservations) {
            const childClass = reservation.children?.school_class;
            if (childClass) {
              // Déterminer le groupe de chaque enfant réservé
              try {
                const { data: childGroup } = await supabase.rpc(
                  'get_school_class_group_for_period',
                  {
                    p_period_id: periodId,
                    p_school_class: childClass
                  }
                );
                
                if (childGroup === finalGroup) {
                  sameGroupReservations++;
                }
              } catch (error) {
                console.error("Erreur lors de la détermination du groupe pour", childClass, ":", error);
                // Fallback : utiliser la même logique que pour l'enfant principal
                const normalizedChildClass = childClass.toUpperCase();
                let childGroupFallback = 'primary';
                
                if (['PS', 'MS'].includes(normalizedChildClass)) {
                  childGroupFallback = 'kindergarten';
                } else if (['GS', 'CP', 'CE1', 'CE2', 'CM1'].includes(normalizedChildClass)) {
                  childGroupFallback = 'primary';
                } else if (normalizedChildClass === 'CM2') {
                  const { data: periodInfo } = await supabase
                    .from("available_holiday_periods")
                    .select("name")
                    .eq("id", periodId)
                    .single();
                  
                  if (periodInfo && ['ETE-01', 'ETE-02', 'ETE-03', 'ETE-04'].includes(periodInfo.name)) {
                    childGroupFallback = 'teen';
                  } else {
                    childGroupFallback = 'primary';
                  }
                } else if (['6ÈME', '6EME', '5ÈME', '5EME', '4ÈME', '4EME', '3ÈME', '3EME', 'SECONDE', 'PREMIÈRE', 'PREMIERE', 'TERMINALE'].includes(normalizedChildClass)) {
                  childGroupFallback = 'teen';
                }
                
                if (childGroupFallback === finalGroup) {
                  sameGroupReservations++;
                }
              }
            }
          }
        }

        console.log("📊 Réservations du même groupe trouvées:", sameGroupReservations, "sur", reservations?.length || 0, "réservations totales");

        // 6. Calculer les places restantes
        const availableSpots = Math.max(0, capacity - sameGroupReservations);

        console.log("🎯 Calcul final:", {
          groupe: finalGroup,
          capacite: capacity,
          reservationsDuGroupe: sameGroupReservations,
          placesRestantes: availableSpots,
          date: dateStr,
          classeEnfant: schoolClass
        });

        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 30 * 1000, // 30 secondes de cache
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const availableSpots = data;
  const isFull = availableSpots !== null && availableSpots <= 0;

  console.log("🎯 useHolidaySpots - Résultat final:", { 
    availableSpots, 
    isFull, 
    isLoading, 
    periodId, 
    schoolClass,
    date: date.toISOString().split('T')[0]
  });

  return { 
    availableSpots, 
    isFull, 
    isLoading, 
    error 
  };
};
