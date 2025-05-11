
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children?: Tables<"children">[] | null;
  setSelectedDates?: (dates: any[]) => void;
}

export const ChildSelector = ({
  selectedChild,
  setSelectedChild,
  children,
  setSelectedDates
}: ChildSelectorProps) => {
  const location = useLocation();
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const isAdminTeenHolidayReservation = location.pathname === "/admin/reservations/new-teen-holiday";
  const isWednesdayReservation = location.pathname === "/wednesday-reservations";
  
  const { isTeenClassSync } = useSchoolClassUtils();
  const [showCM2Message, setShowCM2Message] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  // Requête pour obtenir les informations sur la période sélectionnée
  const { data: periodInfo } = useQuery({
    queryKey: ["holiday_period_info", selectedPeriodId],
    queryFn: async () => {
      if (!selectedPeriodId) return null;
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("name")
        .eq("id", selectedPeriodId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération des informations de période:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedPeriodId
  });

  // Listen for period selection from URL search parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodId = searchParams.get("periodId");
    if (periodId) {
      setSelectedPeriodId(periodId);
    }
  }, [location.search]);

  // Effect to handle child change
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }

    // Check if selected child is CM2 and on holiday reservation page
    const checkCM2TeenMapping = async () => {
      if (selectedChild && isHolidayReservation) {
        const selectedChildData = children?.find(child => child.id === selectedChild);
        
        if (selectedChildData?.school_class === "CM2" && selectedPeriodId) {
          // Vérifier d'abord si c'est une période d'été 2025 spécifique
          if (periodInfo?.name && (
            periodInfo.name === "2025-ETE01" || 
            periodInfo.name === "2025-ETE02" || 
            periodInfo.name === "2025-ETE03" || 
            periodInfo.name === "2025-ETE04"
          )) {
            setShowCM2Message(true);
            return;
          }
          
          // Si ce n'est pas une période spécifique, utiliser la vérification normale
          try {
            const { isTeenClass } = await import("@/hooks/useSchoolClassUtils").then(module => module.useSchoolClassUtils());
            const isTeen = await isTeenClass(selectedChildData.school_class, selectedPeriodId);
            setShowCM2Message(isTeen);
          } catch (error) {
            console.error("Error checking teen class status:", error);
            setShowCM2Message(false);
          }
        } else {
          setShowCM2Message(false);
        }
      } else {
        setShowCM2Message(false);
      }
    };

    checkCM2TeenMapping();
  }, [selectedChild, setSelectedDates, children, isHolidayReservation, selectedPeriodId, periodInfo]);
  
  // Pour la page des mercredis, utiliser les enfants tels quels
  // car ils sont déjà filtrés dans useChildrenData
  const filteredChildren = isWednesdayReservation
    ? children
    : children?.filter(child => {
        const isChildTeen = isTeenClassSync(child.school_class);
        
        // Pour les réservations de vacances normales, exclure les adolescents
        if (isHolidayReservation) {
          return !isChildTeen;
        }
        
        // Pour les réservations de vacances ados, uniquement afficher les adolescents
        if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
          return isChildTeen;
        }
        
        // Pour les autres pages, afficher tous les enfants
        return true;
      });

  // Log pour déboguer
  console.log("Children passed to ChildSelector:", children);
  console.log("Filtered children based on page type:", filteredChildren);
  console.log("Current path:", location.pathname);
  console.log("isWednesdayReservation:", isWednesdayReservation);
  console.log("Selected period ID:", selectedPeriodId);
  console.log("Period info:", periodInfo);
  console.log("Show CM2 message:", showCM2Message);

  return (
    <div>
      <Label htmlFor="child-select">Sélectionner un enfant</Label>
      <select
        id="child-select"
        value={selectedChild}
        onChange={(e) => setSelectedChild(e.target.value)}
        className="w-full mt-2 rounded-md border border-gray-300 p-2"
      >
        <option value="">Choisir un enfant</option>
        {filteredChildren?.length ? (
          filteredChildren.map((child) => (
            <option 
              key={child.id} 
              value={child.id}
            >
              {child.last_name} {child.first_name} ({child.school_class})
            </option>
          ))
        ) : (
          <option value="" disabled>Aucun enfant éligible trouvé</option>
        )}
      </select>
      
      {showCM2Message && (
        <Alert className="mt-3 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-sm text-blue-700">
            Sur le mois de juillet, les enfants en CM2 seront accueilli avec les adolescents, vous pouvez faire votre réservation dans le menu "Club Ado"
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
