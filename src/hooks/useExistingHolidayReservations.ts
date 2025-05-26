
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HolidayReservationWithChild } from "@/types/reservations";
import { toast } from "sonner";

export const useExistingHolidayReservations = (selectedChild: string) => {
  const {
    data: existingReservations,
    refetch: refetchReservations,
    isLoading
  } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) {
        console.log("🔍 useExistingHolidayReservations - Pas d'enfant sélectionné");
        return [];
      }

      console.log("🔄 Fetching reservations for child:", selectedChild);

      try {
        // Debug complet : vérifier toutes les données relatives
        console.log("🔍 DEBUG - Vérification complète des données...");

        // 1. Vérifier que l'enfant existe
        const { data: childData, error: childError } = await supabase
          .from("children")
          .select("*")
          .eq("id", selectedChild)
          .single();

        if (childError) {
          console.error("❌ Erreur lors de la vérification de l'enfant:", childError);
          return [];
        }

        console.log("👤 Enfant trouvé:", childData);

        // 2. Vérifier toutes les réservations dans la base (sans filtre)
        const { data: allReservations, error: allReservationsError } = await supabase
          .from("holiday_reservations")
          .select("*");

        console.log("📊 DEBUG - Total reservations in database:", allReservations?.length || 0);
        console.log("📊 DEBUG - All reservations:", allReservations);

        if (allReservationsError) {
          console.error("❌ Erreur lors de la récupération de toutes les réservations:", allReservationsError);
        }

        // 3. Vérifier les réservations pour cet enfant (tous statuts)
        const { data: childReservationsAllStatus, error: childAllStatusError } = await supabase
          .from("holiday_reservations")
          .select("*")
          .eq("child_id", selectedChild);

        console.log("🔍 DEBUG - Réservations pour cet enfant (tous statuts):", childReservationsAllStatus?.length || 0);
        console.log("🔍 DEBUG - Détails réservations enfant:", childReservationsAllStatus);

        if (childAllStatusError) {
          console.error("❌ Erreur lors de la récupération des réservations enfant:", childAllStatusError);
        }

        // 4. Vérifier les réservations confirmées pour cet enfant
        const { data: confirmedReservations, error: confirmedError } = await supabase
          .from("holiday_reservations")
          .select("*")
          .eq("child_id", selectedChild)
          .eq("status", "confirmed");

        console.log("✅ DEBUG - Réservations confirmées pour cet enfant:", confirmedReservations?.length || 0);
        console.log("✅ DEBUG - Détails réservations confirmées:", confirmedReservations);

        if (confirmedError) {
          console.error("❌ Erreur lors de la récupération des réservations confirmées:", confirmedError);
        }

        // 5. Maintenant, récupérons les réservations avec les données enfant
        const { data, error } = await supabase
          .from("holiday_reservations")
          .select(`
            *,
            children (
              id,
              first_name,
              last_name,
              school_class,
              profile_id
            )
          `)
          .eq("child_id", selectedChild)
          .eq("status", "confirmed");

        if (error) {
          console.error("❌ Error fetching reservations with children:", error);
          toast.error("Erreur lors de la récupération des réservations");
          throw error;
        }

        console.log("✅ Raw existing reservations found:", data?.length || 0);
        console.log("📝 Réservations détaillées:", data);

        if (!data || data.length === 0) {
          console.log("ℹ️ Aucune réservation confirmée trouvée pour cet enfant");
          return [];
        }

        // Transformer les données pour correspondre au type HolidayReservationWithChild
        const transformedData: HolidayReservationWithChild[] = data.map(reservation => {
          const childrenData = reservation.children as any;
          
          console.log("🔄 Transformation de la réservation:", {
            id: reservation.id,
            date: reservation.reservation_date,
            child: childrenData?.first_name,
            class: childrenData?.school_class
          });

          return {
            id: reservation.id || '',
            child_id: reservation.child_id || '',
            period_id: reservation.period_id || '',
            reservation_date: reservation.reservation_date || '',
            reservation_number: reservation.reservation_number || '',
            without_meal: reservation.without_meal || false,
            early_dropoff: reservation.early_dropoff || false,
            status: reservation.status || '',
            created_at: reservation.created_at || '',
            updated_at: reservation.updated_at || '',
            children: {
              id: childrenData?.id || '',
              first_name: childrenData?.first_name || '',
              last_name: childrenData?.last_name || '',
              school_class: childrenData?.school_class || '',
              profile: {
                school_city: '' // Ce champ n'est pas utilisé pour les réservations existantes
              }
            }
          };
        });

        console.log("✅ Réservations transformées:", transformedData.length);
        console.log("📋 Dates des réservations existantes:", transformedData.map(r => r.reservation_date));
        return transformedData;

      } catch (error) {
        console.error("❌ Exception dans useExistingHolidayReservations:", error);
        toast.error("Erreur lors de la récupération des réservations");
        return [];
      }
    },
    enabled: !!selectedChild,
    staleTime: 1000 * 10, // 10 secondes seulement pour forcer le rafraîchissement
    gcTime: 1000 * 30, // 30 secondes
    retry: 1,
    refetchOnWindowFocus: true
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
    console.log("🔍 isDateAlreadyReserved - Vérification pour la date:", date.toISOString().split('T')[0]);
    console.log("🔍 isDateAlreadyReserved - Réservations disponibles:", existingReservations?.length || 0);
    
    if (!existingReservations || existingReservations.length === 0) {
      console.log("📅 Aucune réservation existante pour vérifier la date:", date.toISOString().split('T')[0]);
      return false;
    }

    try {
      const dateToCheck = new Date(date);
      dateToCheck.setHours(0, 0, 0, 0);
      
      const result = existingReservations.some(reservation => {
        if (!reservation.reservation_date) return false;

        const reservationDate = new Date(reservation.reservation_date);
        reservationDate.setHours(0, 0, 0, 0);

        const isReserved = dateToCheck.getTime() === reservationDate.getTime();
        
        if (isReserved) {
          console.log("🚫 Date déjà réservée:", {
            dateChecked: dateToCheck.toISOString().split('T')[0],
            reservationDate: reservation.reservation_date,
            reservationId: reservation.id
          });
        }

        return isReserved;
      });

      console.log("📅 Vérification de la date:", {
        date: date.toISOString().split('T')[0],
        reserved: result,
        totalReservations: existingReservations.length,
        reservationDates: existingReservations.map(r => r.reservation_date)
      });
      
      return result;
    } catch (error) {
      console.error("⚠️ Erreur lors de la vérification de la date réservée:", error);
      return false;
    }
  };

  return {
    existingReservations,
    refetchReservations,
    isDateAlreadyReserved,
    isLoading
  };
};
