
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
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Titre avec date d'export
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(14);
  doc.text("Places disponibles - Mercredis", 14, 15);
  
  doc.setFontSize(9);
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
      format(new Date(spot.date), "dd/MM", { locale: fr }),
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
      fontSize: 7,
      cellPadding: 1
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 25 }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      // Mettre en gras les lignes où il ne reste plus de place dans aucune catégorie
      if (data.section === 'body') {
        const rowIndex = data.row.index;
        const spot = spots[rowIndex];
        
        if (spot) {
          const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
          const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
          
          if (kindergartenAvailable === 0 && primaryAvailable === 0) {
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    }
  });

  doc.save(`places_mercredis_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
