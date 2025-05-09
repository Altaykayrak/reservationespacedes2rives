
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";

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

  // Effect to handle child change
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }
  }, [selectedChild, setSelectedDates]);
  
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
    </div>
  );
};
