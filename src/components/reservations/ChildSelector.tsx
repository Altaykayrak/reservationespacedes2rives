
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

  const { isTeenClass } = useSchoolClassUtils();

  // Effect to handle child change
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }
  }, [selectedChild, setSelectedDates]);

  // Filter and sort children
  const sortedAndFilteredChildren = children
    ?.filter(child => {
      const isTeen = isTeenClass(child.school_class);
      const isPS = child.school_class.toUpperCase().includes("PS");
      
      if (isTeenHolidayReservation || isAdminTeenHolidayReservation) {
        // Pour la page Club Ado (admin et public), montrer uniquement les adolescents
        return isTeen;
      } else if (isHolidayReservation) {
        // Pour les réservations vacances normales, exclure les ados et PS
        return !isTeen && !isPS;
      } else if (isWednesdayReservation) {
        // Pour les réservations mercredis, exclure les ados et PS
        return !isTeen && !isPS;
      } else {
        // Comportement par défaut pour les autres pages
        return true;
      }
    })
    ?.sort((a, b) => {
      // Trier d'abord par nom de famille
      const lastNameComparison = a.last_name.localeCompare(b.last_name, 'fr');
      // Si les noms sont identiques, trier par prénom
      if (lastNameComparison === 0) {
        return a.first_name.localeCompare(b.first_name, 'fr');
      }
      return lastNameComparison;
    });

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
        {sortedAndFilteredChildren?.map((child) => (
          <option 
            key={child.id} 
            value={child.id}
          >
            {child.last_name} {child.first_name} ({child.school_class})
          </option>
        ))}
      </select>
    </div>
  );
};
