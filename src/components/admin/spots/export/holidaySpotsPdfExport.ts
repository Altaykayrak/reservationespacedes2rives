
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface HolidaySpots {
  period_id: string;
  period_name: string;
  reservation_date: string;
  kindergarten_spots: number;
  primary_spots: number;
  teen_spots: number;
  kindergarten_capacity: number;
  primary_capacity: number;
  teen_capacity: number;
}

export const exportHolidaySpotsToPdf = (
  groupedHolidaySpots: Record<string, { period_name: string; dates: HolidaySpots[] }>
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Titre avec date d'export
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(16);
  doc.text("Places disponibles - Vacances", 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  let startY = 30;

  // Pour chaque période
  Object.entries(groupedHolidaySpots).forEach(([periodId, periodData], index) => {
    // Titre de la période (plus compact)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(periodData.period_name, 14, startY);
    startY += 6;

    // En-têtes du tableau pour cette période
    const headers = [
      "Date",
      "Maternelle",
      "Primaire", 
      "Adolescent"
    ];

    // Données du tableau pour cette période (format compact)
    const tableData = periodData.dates.map(spot => [
      format(new Date(spot.reservation_date), "EEE dd/MM", { locale: fr }),
      `${spot.kindergarten_spots}/${spot.kindergarten_capacity}`,
      `${spot.primary_spots}/${spot.primary_capacity}`,
      `${spot.teen_spots}/${spot.teen_capacity}`
    ]);

    // Générer le tableau
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: startY,
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
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 }
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    // Mettre à jour startY pour la prochaine période (espacement réduit)
    startY = (doc as any).lastAutoTable.finalY + 8;

    // Nouvelle page si nécessaire
    if (startY > 185 && index < Object.keys(groupedHolidaySpots).length - 1) {
      doc.addPage();
      startY = 20;
    }
  });

  doc.save(`places_vacances_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
