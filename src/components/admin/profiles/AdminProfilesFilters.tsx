
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AdminProfilesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  automaticPaymentFilter: "all" | boolean;
  setAutomaticPaymentFilter: (value: "all" | boolean) => void;
  waitingFilter: "all" | boolean;
  setWaitingFilter: (value: "all" | boolean) => void;
  closedFilter: "all" | boolean;
  setClosedFilter: (value: "all" | boolean) => void;
}

export const AdminProfilesFilters: React.FC<AdminProfilesFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  automaticPaymentFilter,
  setAutomaticPaymentFilter,
  waitingFilter,
  setWaitingFilter,
  closedFilter,
  setClosedFilter,
}) => {
  return (
    <div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-4">
      <div>
        <Label htmlFor="search">Rechercher par nom:</Label>
        <Input
          type="text"
          id="search"
          placeholder="Rechercher par nom..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div>
        <Label>Prélèvement automatique:</Label>
        <Select 
          value={automaticPaymentFilter.toString()} 
          onValueChange={(value) => setAutomaticPaymentFilter(value === "all" ? "all" : value === "true")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Oui</SelectItem>
            <SelectItem value="false">Non</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>En attente:</Label>
        <Select 
          value={waitingFilter.toString()} 
          onValueChange={(value) => setWaitingFilter(value === "all" ? "all" : value === "true")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Oui</SelectItem>
            <SelectItem value="false">Non</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Fermé:</Label>
        <Select 
          value={closedFilter.toString()} 
          onValueChange={(value) => setClosedFilter(value === "all" ? "all" : value === "true")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tous" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="true">Oui</SelectItem>
            <SelectItem value="false">Non</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
