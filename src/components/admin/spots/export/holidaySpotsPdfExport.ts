
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
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Titre avec date d'export
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(14);
  doc.text("Places disponibles - Vacances", 14, 15);
  
  doc.setFontSize(9);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  let startY = 30;

  // Pour chaque période
  Object.entries(groupedHolidaySpots).forEach(([periodId, periodData], index) => {
    // Titre de la période (plus compact)
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(periodData.period_name, 14, startY);
    startY += 5;

    // En-têtes du tableau pour cette période
    const headers = [
      "Date",
      "Mat.",
      "Prim.", 
      "Ado."
    ];

    // Données du tableau pour cette période (format compact)
    const tableData = periodData.dates.map(spot => [
      format(new Date(spot.reservation_date), "dd/MM", { locale: fr }),
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
        fontSize: 6,
        cellPadding: 0.5
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 15 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 14, right: 14 }
    });

    // Mettre à jour startY pour la prochaine période (espacement réduit)
    startY = (doc as any).lastAutoTable.finalY + 6;

    // Nouvelle page si nécessaire
    if (startY > 250 && index < Object.keys(groupedHolidaySpots).length - 1) {
      doc.addPage();
      startY = 20;
    }
  });

  doc.save(`places_vacances_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
