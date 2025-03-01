
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rdv } from "@/types/rdv";
import RdvItem from "./RdvItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
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

  const handleExportPdf = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const title = `Rendez-vous ${startDate ? `du ${format(new Date(startDate), 'dd/MM/yyyy')}` : ''} ${endDate ? `au ${format(new Date(endDate), 'dd/MM/yyyy')}` : ''}`;
    doc.text(title, 14, 15);
    
    const statusLabel = status === "all" ? "Tous" : status === "disponible" ? "Disponibles" : "Réservés";
    doc.text(`Statut: ${statusLabel}`, 14, 22);

    const headers = [
      "Date",
      "Heure de début",
      "Heure de fin",
      "Statut",
      "Nom",
      "Prénom",
      "Email",
      "Motifs",
    ];

    const data = filteredRdvList.map(rdv => [
      format(new Date(rdv.date), 'dd/MM/yyyy'),
      rdv.heure_debut,
      rdv.heure_fin,
      rdv.status,
      rdv.profiles?.last_name || "-",
      rdv.profiles?.first_name || "-",
      rdv.profiles?.email || "-",
      rdv.motifs ? rdv.motifs.join(", ") : "-"
    ]);

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 1
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center'
      }
    });

    doc.save("rendez-vous.pdf");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rendez-vous disponibles</CardTitle>
        <Button
          variant="outline"
          onClick={handleExportPdf}
          className="flex items-center gap-2"
          disabled={filteredRdvList.length === 0}
        >
          <FileText className="h-4 w-4" />
          Export PDF
        </Button>
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
