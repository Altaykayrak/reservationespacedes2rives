
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { Rdv } from "@/types/rdv";

interface RdvExportButtonProps {
  filteredRdvList: Rdv[];
  startDate: string;
  endDate: string;
  status: string;
  selectedMotifs: string[];
  searchQuery: string;
}

const RdvExportButton: React.FC<RdvExportButtonProps> = ({
  filteredRdvList,
  startDate,
  endDate,
  status,
  selectedMotifs,
  searchQuery,
}) => {
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
    <Button
      variant="outline"
      onClick={handleExportPdf}
      className="flex items-center gap-2"
      disabled={filteredRdvList.length === 0}
    >
      <FileText className="h-4 w-4" />
      Export PDF
    </Button>
  );
};

export default RdvExportButton;
