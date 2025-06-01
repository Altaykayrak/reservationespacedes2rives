
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { MOTIFS_OPTIONS } from "@/types/rdv";

interface RdvFiltersProps {
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  status: string;
  setStatus: (status: string) => void;
  selectedMotifs: string[];
  setSelectedMotifs: (motifs: string[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const RdvFilters: React.FC<RdvFiltersProps> = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  status,
  setStatus,
  selectedMotifs,
  setSelectedMotifs,
  searchQuery,
  setSearchQuery,
}) => {
  // Handle motif selection
  const handleMotifChange = (motif: string) => {
    setSelectedMotifs(
      selectedMotifs.includes(motif) 
        ? selectedMotifs.filter(m => m !== motif) 
        : [...selectedMotifs, motif]
    );
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar */}
      <div className="space-y-2">
        <Label htmlFor="search">Rechercher par nom ou email</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search"
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Date de début</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Date de fin</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="réservé">Réservé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Motifs filter */}
      <div className="space-y-2">
        <Label>Motifs</Label>
        <div className="flex flex-wrap gap-4">
          {MOTIFS_OPTIONS.map((motif) => (
            <div key={motif} className="flex items-center space-x-2">
              <Checkbox 
                id={`motif-${motif}`} 
                checked={selectedMotifs.includes(motif)}
                onCheckedChange={() => handleMotifChange(motif)}
              />
              <label 
                htmlFor={`motif-${motif}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {motif}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RdvFilters;
