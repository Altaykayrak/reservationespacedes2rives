
import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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

  // Fetch school class categories to identify teen classes
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Function to check if a child is in the teen category
  const isTeenClass = (schoolClass: string) => {
    return schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        schoolClass.toUpperCase() === category.name.toUpperCase()
    );
  };

  // Effect to handle child change
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      // Reset dates when changing child
      setSelectedDates([]);
    }
  }, [selectedChild, setSelectedDates]);

  // Filter children based on the current page and class
  const filteredChildren = children?.filter(child => {
    const isTeen = isTeenClass(child.school_class);
    const isPS = child.school_class.toUpperCase().includes("PS");
    
    if (isTeenHolidayReservation) {
      // Pour la page Club Ado, montrer uniquement les adolescents
      return isTeen;
    } else if (isHolidayReservation) {
      // Pour les réservations vacances normales, exclure les ados et PS
      return !isTeen && !isPS;
    } else {
      // Pour les réservations mercredis, exclure les ados et PS
      return !isTeen && !isPS;
    }
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
        {filteredChildren?.map((child) => (
          <option 
            key={child.id} 
            value={child.id}
          >
            {child.first_name} {child.last_name} ({child.school_class})
          </option>
        ))}
      </select>
    </div>
  );
};
