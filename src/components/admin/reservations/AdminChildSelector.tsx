
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";

interface ChildWithProfile extends Tables<"children"> {
  profile?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface AdminChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children: ChildWithProfile[] | null | undefined;
  setSelectedDates?: (dates: any[]) => void;
}

export const AdminChildSelector = ({ 
  selectedChild, 
  setSelectedChild, 
  children,
  setSelectedDates,
}: AdminChildSelectorProps) => {
  // Trier les enfants par ordre alphabétique du nom de famille
  const sortedChildren = useMemo(() => {
    if (!children) return [];
    
    return [...children].sort((a, b) => {
      return a.last_name.localeCompare(b.last_name, 'fr', { sensitivity: 'base' });
    });
  }, [children]);

  // Réinitialiser les dates lorsqu'un nouvel enfant est sélectionné
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      setSelectedDates([]);
    }
  }, [selectedChild, setSelectedDates]);

  if (!sortedChildren || sortedChildren.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Aucun enfant trouvé dans la base de données.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="child">Sélectionner un enfant</Label>
        <Select
          value={selectedChild}
          onValueChange={(value) => {
            setSelectedChild(value);
          }}
        >
          <SelectTrigger id="child" className="w-full">
            <SelectValue placeholder="Sélectionner un enfant" />
          </SelectTrigger>
          <SelectContent>
            {sortedChildren.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.first_name} {child.last_name} - {child.school_class}
                {child.profile && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Parent: {child.profile.first_name} {child.profile.last_name})
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
