
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fonction pour déterminer le groupe selon les règles spécifiques
const getClassGroupForPeriod = (schoolClass: string, periodName: string): 'kindergarten' | 'primary' | 'teen' | null => {
  const normalizedClass = schoolClass.trim().toUpperCase();
  const isSummerPeriod = ['ETE-01', 'ETE-02', 'ETE-03', 'ETE-04'].includes(periodName);
  
  // PS, MS → Maternelle (kindergarten) sur toutes les périodes
  if (['PS', 'MS'].includes(normalizedClass)) {
    return 'kindergarten';
  }
  
  // GS, CP, CE1, CE2, CM1 → Primaire (primary) sur toutes les périodes
  if (['GS', 'CP', 'CE1', 'CE2', 'CM1'].includes(normalizedClass)) {
    return 'primary';
  }
  
  // CM2 - Règle spéciale : été = teen, autres = primary
  if (normalizedClass === 'CM2') {
    return isSummerPeriod ? 'teen' : 'primary';
  }
  
  // 6ème à Terminale → Adolescent (teen)
  if (['6EME', '6ÈME', '5EME', '5ÈME', '4EME', '4ÈME', '3EME', '3ÈME', 
       'SECONDE', 'PREMIERE', 'PREMIÈRE', 'TERMINALE'].includes(normalizedClass)) {
    return 'teen';
  }
  
  console.warn("Classe non reconnue:", normalizedClass);
  return null;
};

export const useHolidaySpots = (periodId: string, date: Date, schoolClass: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["holidaySpots", periodId, date.toISOString(), schoolClass],
    queryFn: async () => {
      if (!periodId || !date || !schoolClass || isNaN(date.getTime())) {
        console.log("🔍 useHolidaySpots - Paramètres invalides:", { periodId, date, schoolClass });
        return null;
      }

      try {
        const dateStr = date.toISOString().split('T')[0];
        
        console.log("🔄 useHolidaySpots - Calcul des places pour:", {
          periodId,
          date: dateStr,
          schoolClass
        });

        // 1. Récupérer les informations de la période
        const { data: periodData, error: periodError } = await supabase
          .from("available_holiday_periods")
          .select("name, max_participants_kindergarten, max_participants_primary, max_participants_teen")
          .eq("id", periodId)
          .single();

        if (periodError || !periodData) {
          console.error("❌ Erreur récupération période:", periodError);
          return null;
        }

        // 2. Déterminer le groupe de la classe selon les règles spécifiques
        const classGroup = getClassGroupForPeriod(schoolClass, periodData.name);
        
        if (!classGroup) {
          console.warn("⚠️ Classe non supportée:", schoolClass);
          return null;
        }

        console.log("📊 Groupe déterminé:", classGroup, "pour la classe:", schoolClass, "période:", periodData.name);

        // 3. Récupérer la capacité maximale pour ce groupe
        let maxCapacity: number;
        switch (classGroup) {
          case 'kindergarten':
            maxCapacity = periodData.max_participants_kindergarten;
            break;
          case 'primary':
            maxCapacity = periodData.max_participants_primary;
            break;
          case 'teen':
            maxCapacity = periodData.max_participants_teen;
            break;
          default:
            console.error("❌ Groupe non supporté:", classGroup);
            return null;
        }

        // 4. Récupérer toutes les réservations confirmées pour cette période et cette date
        const { data: reservations, error: reservationsError } = await supabase
          .from("holiday_reservations_with_children")
          .select("*")
          .eq("period_id", periodId)
          .eq("reservation_date", dateStr)
          .eq("status", "confirmed");

        if (reservationsError) {
          console.error("❌ Erreur récupération réservations:", reservationsError);
          return null;
        }

        // 5. Filtrer les réservations qui appartiennent au même groupe
        const reservationsInGroup = reservations?.filter(reservation => {
          if (!reservation.children || typeof reservation.children !== 'object') {
            console.warn("⚠️ Données enfant manquantes pour la réservation:", reservation.id);
            return false;
          }
          
          const childData = reservation.children as any;
          const childClass = childData?.school_class;
          
          if (!childClass) {
            console.warn("⚠️ Classe enfant manquante:", reservation.id);
            return false;
          }
          
          const reservationGroup = getClassGroupForPeriod(childClass, periodData.name);
          const belongs = reservationGroup === classGroup;
          
          console.log("🔍 Réservation", reservation.id, "- Classe:", childClass, "→ Groupe:", reservationGroup, "Correspond:", belongs);
          
          return belongs;
        }) || [];

        const reservedCount = reservationsInGroup.length;
        const availableSpots = Math.max(maxCapacity - reservedCount, 0);

        console.log("✅ useHolidaySpots - Calcul terminé:", {
          classGroup,
          maxCapacity,
          reservedCount,
          availableSpots,
          periodName: periodData.name,
          schoolClass,
          date: dateStr,
          totalReservations: reservations?.length || 0,
          reservationsInGroup: reservationsInGroup.length
        });

        return availableSpots;

      } catch (error) {
        console.error("❌ useHolidaySpots - Exception:", error);
        toast.error("Erreur lors du calcul des places disponibles");
        return null;
      }
    },
    enabled: !!periodId && !!date && !!schoolClass && !isNaN(date.getTime()),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
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
