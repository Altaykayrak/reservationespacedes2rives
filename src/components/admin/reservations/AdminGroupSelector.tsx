
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AdminGroupSelectorProps {
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  onChildReset: () => void;
}

export const AdminGroupSelector = ({ 
  selectedGroup, 
  onGroupChange, 
  onChildReset 
}: AdminGroupSelectorProps) => {
  const handleGroupChange = (value: string) => {
    onGroupChange(value);
    onChildReset();
  };

  return (
    <div className="space-y-2">
      <Label>Sélectionner un groupe</Label>
      <Select value={selectedGroup} onValueChange={handleGroupChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sélectionner un groupe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les groupes</SelectItem>
          <SelectItem value="maternelle">Maternelle</SelectItem>
          <SelectItem value="primaire">Primaire</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
