
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
  doc.setFontSize(18);
  doc.text("Places disponibles - Vacances", 14, 15);
  
  doc.setFontSize(12);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  let startY = 35;

  // Pour chaque période
  Object.entries(groupedHolidaySpots).forEach(([periodId, periodData], index) => {
    // Titre de la période
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(periodData.period_name, 14, startY);
    startY += 8;

    // En-têtes du tableau pour cette période
    const headers = [
      "Date",
      "Maternelle Dispo/Total",
      "Primaire Dispo/Total", 
      "Adolescent Dispo/Total"
    ];

    // Données du tableau pour cette période
    const tableData = periodData.dates.map(spot => [
      format(new Date(spot.reservation_date), "EEEE dd/MM", { locale: fr }),
      `${spot.kindergarten_spots}/${spot.kindergarten_capacity}`,
      `${spot.primary_spots}/${spot.primary_capacity}`,
      `${spot.teen_spots}/${spot.teen_capacity}`
    ]);

    // Calculer les totaux pour cette période
    const periodTotals = periodData.dates.reduce((acc, spot) => ({
      kindergartenAvailable: acc.kindergartenAvailable + spot.kindergarten_spots,
      kindergartenTotal: acc.kindergartenTotal + spot.kindergarten_capacity,
      primaryAvailable: acc.primaryAvailable + spot.primary_spots,
      primaryTotal: acc.primaryTotal + spot.primary_capacity,
      teenAvailable: acc.teenAvailable + spot.teen_spots,
      teenTotal: acc.teenTotal + spot.teen_capacity
    }), {
      kindergartenAvailable: 0,
      kindergartenTotal: 0,
      primaryAvailable: 0,
      primaryTotal: 0,
      teenAvailable: 0,
      teenTotal: 0
    });

    // Ajouter ligne de totaux
    tableData.push([
      "TOTAL",
      `${periodTotals.kindergartenAvailable}/${periodTotals.kindergartenTotal}`,
      `${periodTotals.primaryAvailable}/${periodTotals.primaryTotal}`,
      `${periodTotals.teenAvailable}/${periodTotals.teenTotal}`
    ]);

    // Générer le tableau
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: startY,
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
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      didParseCell: (data) => {
        // Style pour la ligne de totaux
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [220, 220, 220];
        }
      }
    });

    // Mettre à jour startY pour la prochaine période
    startY = (doc as any).lastAutoTable.finalY + 15;

    // Nouvelle page si nécessaire
    if (startY > 180 && index < Object.keys(groupedHolidaySpots).length - 1) {
      doc.addPage();
      startY = 20;
    }
  });

  doc.save(`places_vacances_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
