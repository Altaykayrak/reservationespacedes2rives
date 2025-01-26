import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children?: Tables<"children">[] | null;
}

export const ChildSelector = ({
  selectedChild,
  setSelectedChild,
  children
}: ChildSelectorProps) => {
  // Fetch school class categories to identify PS classes only
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .eq("category", "adolescent");
      
      if (error) throw error;
      return data;
    },
  });

  // Filter out only children in PS class
  const filteredChildren = children?.filter(child => {
    const isPS = child.school_class.toUpperCase().includes("PS");
    return !isPS;
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
          <option key={child.id} value={child.id}>
            {child.first_name} {child.last_name} ({child.school_class})
          </option>
        ))}
      </select>
    </div>
  );
};