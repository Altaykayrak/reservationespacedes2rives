import { Label } from "@/components/ui/label";
import { Tables } from "@/integrations/supabase/types";

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
  // Filter out children in "PS" class
  const filteredChildren = children?.filter(child => child.school_class !== "PS");

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