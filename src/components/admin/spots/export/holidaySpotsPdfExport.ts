
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

  // Couleurs pastel comme sur la page web
  const periodColors = [
    [240, 253, 244], // Vert pastel
    [250, 245, 255], // Violet pastel
    [255, 247, 237], // Orange pastel
    [253, 242, 248], // Rose pastel
    [254, 249, 195], // Jaune pastel
    [238, 242, 255], // Indigo pastel
    [254, 242, 242], // Rouge pastel
    [240, 253, 250], // Teal pastel
  ];

  // Titre avec style amélioré
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(107, 114, 128); // Gris foncé
  doc.text("Places disponibles - Vacances", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(156, 163, 175); // Gris moyen
  doc.text(`Exporté le ${currentDate}`, 14, 28);

  // Badge avec le nombre de périodes (style web)
  doc.setFontSize(8);
  doc.setFont(undefined, 'bold');
  doc.setFillColor(229, 231, 235); // Gris clair
  doc.setTextColor(75, 85, 99); // Gris foncé
  const periodCount = Object.keys(groupedHolidaySpots).length;
  const badgeText = `${periodCount} période${periodCount > 1 ? 's' : ''}`;
  const badgeWidth = doc.getTextWidth(badgeText) + 6;
  doc.roundedRect(180 - badgeWidth, 16, badgeWidth, 8, 2, 2, 'F');
  doc.text(badgeText, 183 - badgeWidth, 21);

  let startY = 38;

  // Fonction pour trier les périodes comme sur la page web
  const sortPeriods = (periods: Record<string, { period_name: string; dates: HolidaySpots[] }>) => {
    return Object.entries(periods).sort(([, a], [, b]) => {
      const aMatch = a.period_name.match(/^ETE-(\d+)$/);
      const bMatch = b.period_name.match(/^ETE-(\d+)$/);
      
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      if (aMatch) return -1;
      if (bMatch) return 1;
      return a.period_name.localeCompare(b.period_name);
    });
  };

  // Fonction pour trier les dates
  const sortDates = (dates: HolidaySpots[]) => {
    return [...dates].sort((a, b) => {
      return new Date(a.reservation_date).getTime() - new Date(b.reservation_date).getTime();
    });
  };

  // Pour chaque période avec style amélioré
  sortPeriods(groupedHolidaySpots).forEach(([periodId, periodData], index) => {
    const colorIndex = index % periodColors.length;
    const bgColor = periodColors[colorIndex];

    // En-tête de période avec couleur de fond pastel
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(14, startY - 2, 182, 15, 2, 2, 'F');
    
    // Titre de la période
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(55, 65, 81); // Gris très foncé
    doc.text(periodData.period_name, 18, startY + 6);
    
    // Nombre de jours
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`${periodData.dates.length} jours disponibles`, 18, startY + 11);
    
    startY += 20;

    // En-têtes du tableau avec style amélioré
    const headers = ["Date", "Maternelle", "Primaire", "Adolescent"];

    // Données du tableau avec style complet
    const tableData = sortDates(periodData.dates).map(spot => {
      const dateFormatted = format(new Date(spot.reservation_date), "EEEE dd MMMM yyyy", { locale: fr });
      
      return [
        dateFormatted,
        `${spot.kindergarten_spots}/${spot.kindergarten_capacity}`,
        `${spot.primary_spots}/${spot.primary_capacity}`,
        `${spot.teen_spots}/${spot.teen_capacity}`
      ];
    });

    // Générer le tableau avec style web
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [229, 231, 235],
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [147, 51, 234], // Violet comme le thème principal
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9
      },
      columnStyles: {
        0: { 
          cellWidth: 70,
          fontSize: 7,
          fontStyle: 'bold',
          textColor: [55, 65, 81]
        },
        1: { 
          halign: 'center', 
          cellWidth: 25,
          fontSize: 8
        },
        2: { 
          halign: 'center', 
          cellWidth: 25,
          fontSize: 8
        },
        3: { 
          halign: 'center', 
          cellWidth: 25,
          fontSize: 8
        }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // Gris très clair
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0) {
          const cellText = data.cell.text[0];
          const [spots, capacity] = cellText.split('/').map(Number);
          
          // Couleurs des badges selon le pourcentage comme sur la page web
          if (capacity === 0) {
            // Pas de couleur spéciale
          } else if (spots === 0) {
            // Rouge pour 0 places
            data.cell.styles.fillColor = [254, 242, 242];
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = 'bold';
          } else {
            const percentage = (spots / capacity) * 100;
            if (percentage <= 25) {
              // Orange pour faible disponibilité
              data.cell.styles.fillColor = [255, 247, 237];
              data.cell.styles.textColor = [194, 65, 12];
            } else if (percentage <= 50) {
              // Jaune pour disponibilité moyenne
              data.cell.styles.fillColor = [254, 249, 195];
              data.cell.styles.textColor = [161, 98, 7];
            } else {
              // Vert pour bonne disponibilité
              data.cell.styles.fillColor = [240, 253, 244];
              data.cell.styles.textColor = [22, 101, 52];
            }
          }
        }
        
        // Mettre en gras les lignes où il reste 0 places dans au moins une catégorie
        if (data.section === 'body') {
          const rowIndex = data.row.index;
          const spot = sortDates(periodData.dates)[rowIndex];
          
          if (spot && (spot.kindergarten_spots === 0 || spot.primary_spots === 0 || spot.teen_spots === 0)) {
            if (data.column.index === 0) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [185, 28, 28];
            }
          }
        }
      }
    });

    // Mettre à jour startY pour la prochaine période
    startY = (doc as any).lastAutoTable.finalY + 12;

    // Nouvelle page si nécessaire
    if (startY > 250 && index < Object.keys(groupedHolidaySpots).length - 1) {
      doc.addPage();
      startY = 20;
    }
  });

  // Ajouter une légende en bas de page
  const finalY = (doc as any).lastAutoTable?.finalY || startY;
  if (finalY < 260) {
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text("Légende: Les dates en rouge indiquent au moins une catégorie complète", 14, finalY + 10);
  }

  doc.save(`places_vacances_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
