
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rdv } from "@/types/rdv";
import RdvItem from "./RdvItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface RdvListProps {
  rdvList: Rdv[];
  loading: boolean;
  onDeleteRdv: (id: string) => void;
}

const RdvList: React.FC<RdvListProps> = ({ rdvList, loading, onDeleteRdv }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("all");

  // Filter rdvList based on the filter criteria
  const filteredRdvList = rdvList.filter((rdv) => {
    // Filter by date range if set
    const dateMatches = 
      (!startDate || rdv.date >= startDate) && 
      (!endDate || rdv.date <= endDate);
    
    // Filter by status if not "all"
    const statusMatches = 
      status === "all" || 
      (status === "disponible" && rdv.status === "disponible") ||
      (status === "réservé" && rdv.status === "réservé");
    
    return dateMatches && statusMatches;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendez-vous disponibles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6">
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
        </div>

        {loading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : filteredRdvList.length === 0 ? (
          <div className="text-center py-4">Aucun rendez-vous ne correspond aux critères</div>
        ) : (
          <div className="space-y-4">
            {filteredRdvList.map((rdv) => (
              <RdvItem 
                key={rdv.id} 
                rdv={rdv} 
                onDeleteRdv={onDeleteRdv} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RdvList;
