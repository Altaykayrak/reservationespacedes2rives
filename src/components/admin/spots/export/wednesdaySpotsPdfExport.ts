
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
  doc.setFontSize(18);
  doc.text("Places disponibles - Mercredis", 14, 15);
  
  doc.setFontSize(12);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  // En-têtes du tableau
  const headers = [
    "Date",
    "Places Maternelle",
    "Réservées Maternelle", 
    "Disponibles Maternelle",
    "Places Primaire",
    "Réservées Primaire",
    "Disponibles Primaire"
  ];

  // Données du tableau
  const tableData = spots.map(spot => {
    const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
    const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
    
    return [
      format(new Date(spot.date), "EEEE dd MMMM yyyy", { locale: fr }),
      spot.max_participants_kindergarten.toString(),
      spot.kindergarten_reserved.toString(),
      kindergartenAvailable.toString(),
      spot.max_participants_primary.toString(),
      spot.primary_reserved.toString(),
      primaryAvailable.toString()
    ];
  });

  // Calculer les totaux
  const totals = spots.reduce((acc, spot) => {
    const kindergartenAvailable = spot.max_participants_kindergarten - spot.kindergarten_reserved;
    const primaryAvailable = spot.max_participants_primary - spot.primary_reserved;
    
    return {
      totalKindergartenCapacity: acc.totalKindergartenCapacity + spot.max_participants_kindergarten,
      totalKindergartenReserved: acc.totalKindergartenReserved + spot.kindergarten_reserved,
      totalKindergartenAvailable: acc.totalKindergartenAvailable + kindergartenAvailable,
      totalPrimaryCapacity: acc.totalPrimaryCapacity + spot.max_participants_primary,
      totalPrimaryReserved: acc.totalPrimaryReserved + spot.primary_reserved,
      totalPrimaryAvailable: acc.totalPrimaryAvailable + primaryAvailable
    };
  }, {
    totalKindergartenCapacity: 0,
    totalKindergartenReserved: 0,
    totalKindergartenAvailable: 0,
    totalPrimaryCapacity: 0,
    totalPrimaryReserved: 0,
    totalPrimaryAvailable: 0
  });

  // Ajouter ligne de totaux
  tableData.push([
    "TOTAL",
    totals.totalKindergartenCapacity.toString(),
    totals.totalKindergartenReserved.toString(),
    totals.totalKindergartenAvailable.toString(),
    totals.totalPrimaryCapacity.toString(),
    totals.totalPrimaryReserved.toString(),
    totals.totalPrimaryAvailable.toString()
  ]);

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 9,
      cellPadding: 2
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

  doc.save(`places_mercredis_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
