
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HolidayReservationWithChild } from "@/types/reservations";

export const useHolidayReservations = () => {
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const {
    data: reservations,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["holiday_reservations"],
    queryFn: async (): Promise<HolidayReservationWithChild[]> => {
      console.log("🔄 Récupération des réservations de vacances...");
      
      try {
        // Vérification de l'authentification de l'utilisateur
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("❌ Erreur d'authentification:", userError);
          setErrorDetails(`Erreur d'authentification: ${userError.message}`);
          throw new Error("Not authenticated");
        }
        
        if (!user) {
          console.error("❌ Utilisateur non authentifié");
          setErrorDetails("Session utilisateur non trouvée");
          throw new Error("Not authenticated");
        }
        
        console.log("✅ Utilisateur authentifié:", user.email);
        
        // S'assurer que les enfants existent pour cet utilisateur
        const { data: userChildren, error: childrenError } = await supabase
          .from("children")
          .select("id")
          .eq("profile_id", user.id);
        
        if (childrenError) {
          console.error("❌ Erreur lors de la récupération des enfants:", childrenError);
          setErrorDetails(`Erreur lors de la récupération des enfants: ${childrenError.message}`);
          throw childrenError;
        }
        
        if (!userChildren || userChildren.length === 0) {
          console.log("ℹ️ Aucun enfant trouvé pour cet utilisateur");
          return [];
        }
        
        const childIds = userChildren.map(child => child.id);
        console.log(`✅ ${childIds.length} enfants trouvés:`, childIds);
        
        // Récupération des réservations de vacances pour les enfants de l'utilisateur
        const { data: reservationsData, error: reservationsError } = await supabase
          .from("holiday_reservations_with_children")
          .select("*")
          .eq("status", "confirmed")
          .in("child_id", childIds)
          .order("reservation_date", { ascending: true });
        
        if (reservationsError) {
          console.error("❌ Erreur lors de la récupération des réservations:", reservationsError);
          setErrorDetails(`Erreur lors de la récupération des réservations: ${reservationsError.message}`);
          throw reservationsError;
        }
        
        console.log(`✅ ${reservationsData?.length || 0} réservations récupérées`);
        
        // Transformation des données pour correspondre au type HolidayReservationWithChild
        const transformedData = reservationsData?.map(reservation => {
          if (!reservation || !reservation.children) {
            console.warn("⚠️ Réservation invalide détectée", reservation);
            return null;
          }
          
          const childrenData = reservation.children as any;
          
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
              id: childrenData.id || '',
              first_name: childrenData.first_name || '',
              last_name: childrenData.last_name || '',
              school_class: childrenData.school_class || '',
              profile: {
                school_city: childrenData.profile?.school_city || ''
              }
            }
          } as HolidayReservationWithChild;
        }).filter(Boolean) as HolidayReservationWithChild[];
        
        return transformedData || [];
      } catch (error) {
        console.error("❌ Erreur générale:", error);
        if (error instanceof Error) {
          setErrorDetails(error.message);
          throw error;
        }
        throw new Error("Une erreur inconnue est survenue");
      }
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });

  return { 
    reservations: reservations || [], 
    isLoading, 
    isError, 
    error: error as Error | null,
    errorDetails,
    refetch 
  };
};
