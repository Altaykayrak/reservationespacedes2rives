
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildrenFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedClass: string;
  onClassChange: (value: string) => void;
  selectedGroup: string;
  onGroupChange: (value: string) => void;
}

export const ChildrenFilters = ({
  searchQuery,
  onSearchChange,
  selectedClass,
  onClassChange,
  selectedGroup,
  onGroupChange,
}: ChildrenFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      <Input
        placeholder="Rechercher par nom..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Classe</Label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              <SelectItem value="PS">PS</SelectItem>
              <SelectItem value="MS">MS</SelectItem>
              <SelectItem value="GS">GS</SelectItem>
              <SelectItem value="CP">CP</SelectItem>
              <SelectItem value="CE1">CE1</SelectItem>
              <SelectItem value="CE2">CE2</SelectItem>
              <SelectItem value="CM1">CM1</SelectItem>
              <SelectItem value="CM2">CM2</SelectItem>
              <SelectItem value="6EME">6EME</SelectItem>
              <SelectItem value="5EME">5EME</SelectItem>
              <SelectItem value="4EME">4EME</SelectItem>
              <SelectItem value="3EME">3EME</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Groupe</Label>
          <Select value={selectedGroup} onValueChange={onGroupChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un groupe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              <SelectItem value="maternelle">Maternelle</SelectItem>
              <SelectItem value="primaire">Primaire</SelectItem>
              <SelectItem value="ado">Ado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
