
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rdv } from "@/types/rdv";
import RdvItem from "./RdvItem";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { MOTIFS_OPTIONS } from "@/types/rdv";

interface RdvListProps {
  rdvList: Rdv[];
  loading: boolean;
  onDeleteRdv: (id: string) => void;
}

const RdvList: React.FC<RdvListProps> = ({ rdvList, loading, onDeleteRdv }) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handle motif selection
  const handleMotifChange = (motif: string) => {
    setSelectedMotifs(prev => 
      prev.includes(motif) 
        ? prev.filter(m => m !== motif) 
        : [...prev, motif]
    );
  };

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
    
    // Filter by motifs if any are selected
    const motifsMatch = 
      selectedMotifs.length === 0 || 
      (rdv.motifs && 
        selectedMotifs.some(motif => rdv.motifs?.includes(motif)));
    
    // Filter by search query (user name)
    const searchMatches = 
      !searchQuery ||
      (rdv.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rdv.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rdv.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return dateMatches && statusMatches && motifsMatch && searchMatches;
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
    
    // Add total count of appointments
    doc.text(`Nombre total de rendez-vous: ${filteredRdvList.length}`, 14, 29);

    // Add selected motifs if any
    if (selectedMotifs.length > 0) {
      doc.text(`Motifs: ${selectedMotifs.join(', ')}`, 14, 36);
    }

    // Add search query if any
    if (searchQuery) {
      doc.text(`Recherche: ${searchQuery}`, 14, selectedMotifs.length > 0 ? 43 : 36);
    }

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
      startY: searchQuery ? (selectedMotifs.length > 0 ? 50 : 43) : (selectedMotifs.length > 0 ? 43 : 36),
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
