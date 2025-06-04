
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface WednesdaySpots {
  id: string;
  date: string;
  max_participants_kindergarten: number;
  max_participants_primary: number;
  kindergarten_reserved: number;
  primary_reserved: number;
}

export const exportWednesdaySpotsToPdf = (spots: WednesdaySpots[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Titre avec date d'export
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(16);
  doc.text("Places disponibles - Mercredis", 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  // En-têtes du tableau
  const headers = [
    "Date",
    "Maternelle",
    "Primaire"
  ];

  // Données du tableau
  const tableData = spots.map(spot => {
    const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
    const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
    
    return [
      format(new Date(spot.date), "EEE dd/MM/yyyy", { locale: fr }),
      `${kindergartenAvailable}/${spot.max_participants_kindergarten}`,
      `${primaryAvailable}/${spot.max_participants_primary}`
    ];
  });

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 8,
      cellPadding: 1.5
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 25 }
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });

  doc.save(`places_mercredis_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
