import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HolidayReservationWithChild } from "@/types/reservations";
import { toast } from "sonner";
import { useRef } from "react";

export const useExistingHolidayReservations = (selectedChild: string) => {
  // Utiliser une ref pour conserver les données de la dernière requête réussie
  const lastSuccessfulDataRef = useRef<HolidayReservationWithChild[]>([]);
  const lastSelectedChildRef = useRef<string>('');

  const {
    data: existingReservations,
    refetch: refetchReservations,
    isLoading
  } = useQuery({
    queryKey: ["existing_holiday_reservations", selectedChild],
    queryFn: async () => {
      if (!selectedChild) {
        console.log("🔍 useExistingHolidayReservations - Pas d'enfant sélectionné");
        // Retourner les données de la dernière requête si l'enfant sélectionné devient vide temporairement
        return lastSuccessfulDataRef.current;
      }

      console.log("🔄 Fetching reservations for child:", selectedChild);

      try {
        // Utilisation de la vue holiday_reservations_with_children
        const { data, error } = await supabase
          .from("holiday_reservations_with_children")
          .select("*")
          .eq("child_id", selectedChild)
          .eq("status", "confirmed");

        if (error) {
          console.error("❌ Error fetching reservations from view:", error);
          toast.error("Erreur lors de la récupération des réservations");
          throw error;
        }

        console.log("✅ Raw existing reservations found from view:", data?.length || 0);
        console.log("📝 Réservations détaillées depuis la vue:", data);

        if (!data || data.length === 0) {
          console.log("ℹ️ Aucune réservation confirmée trouvée pour cet enfant dans la vue");
          // Nettoyer les données si c'est un nouvel enfant sans réservations
          if (selectedChild !== lastSelectedChildRef.current) {
            lastSuccessfulDataRef.current = [];
            lastSelectedChildRef.current = selectedChild;
          }
          return [];
        }

        // Transformer les données pour correspondre au type HolidayReservationWithChild
        const transformedData: HolidayReservationWithChild[] = data.map(reservation => {
          const childrenData = reservation.children as any;
          
          console.log("🔄 Transformation de la réservation depuis la vue:", {
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
                school_city: childrenData?.profile?.school_city || ''
              }
            }
          };
        });

        console.log("✅ Réservations transformées depuis la vue:", transformedData.length);
        console.log("📋 Dates des réservations existantes:", transformedData.map(r => r.reservation_date));
        
        // Mettre à jour les refs avec les nouvelles données
        lastSuccessfulDataRef.current = transformedData;
        lastSelectedChildRef.current = selectedChild;
        
        return transformedData;

      } catch (error) {
        console.error("❌ Exception dans useExistingHolidayReservations:", error);
        toast.error("Erreur lors de la récupération des réservations");
        return lastSuccessfulDataRef.current; // Retourner les dernières données connues en cas d'erreur
      }
    },
    enabled: true, // Toujours activer pour permettre le cache
    staleTime: 1000 * 30, // 30 secondes pour éviter les rechargements fréquents
    gcTime: 1000 * 60, // 60 secondes pour garder les données en cache
    retry: 1,
    refetchOnWindowFocus: true
  });

  const isDateAlreadyReserved = (date: Date): boolean => {
    console.log("🔍 isDateAlreadyReserved - Vérification pour la date:", date.toISOString().split('T')[0]);
    console.log("🔍 isDateAlreadyReserved - Réservations disponibles:", existingReservations?.length || 0);
    console.log("🔍 isDateAlreadyReserved - Détail des réservations:", existingReservations?.map(r => ({
      id: r.id,
      date: r.reservation_date,
      child: r.children?.first_name
    })));
    
    if (!existingReservations || existingReservations.length === 0) {
      console.log("📅 Aucune réservation existante pour vérifier la date:", date.toISOString().split('T')[0]);
      return false;
    }

    try {
      const dateToCheck = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const result = existingReservations.some(reservation => {
        if (!reservation.reservation_date) {
          console.log("⚠️ Réservation sans date:", reservation.id);
          return false;
        }

        // Normaliser la date de réservation au format YYYY-MM-DD
        const reservationDate = new Date(reservation.reservation_date).toISOString().split('T')[0];

        const isReserved = dateToCheck === reservationDate;
        
        if (isReserved) {
          console.log("🚫 Date déjà réservée:", {
            dateChecked: dateToCheck,
            reservationDate: reservationDate,
            reservationId: reservation.id,
            childName: reservation.children?.first_name
          });
        }

        return isReserved;
      });

      console.log("📅 Vérification de la date:", {
        date: dateToCheck,
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