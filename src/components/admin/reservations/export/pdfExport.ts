
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ExportData } from "./types";
import { formatDate } from "./utils";

// Définir les symboles pour les repas
const MEAL_SYMBOLS = {
  WITH_MEAL: '🍽', // Pictogramme de couvert
  WITHOUT_MEAL: '🚫🍽' // Pictogramme de couvert barré
};

export const exportToPdf = (
  exportData: ExportData,
  startDate: string,
  endDate: string
) => {
  const { dates, childrenByClass } = exportData;
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Titre avec période
  const title = `Réservations du ${startDate || "début"} au ${endDate || "fin"}`;
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // En-têtes avec jours formatés (format court : Lu 07/07)
  const headers = [
    "Nom",
    "Prénom", 
    "Classe",
    ...dates.map(date => formatDate(date, true))
  ];

  // Préparer les données par classe
  let allTableData: any[] = [];
  
  // Map pour calculer les totaux par date
  const totals = new Map<string, number>();
  dates.forEach(date => {
    totals.set(date, 0);
  });

  // Trier les classes
  const sortedClasses = Array.from(childrenByClass.keys()).sort();

  // Traiter chaque classe
  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    // Ajouter l'en-tête de classe
    allTableData.push([
      { content: `Classe: ${className}`, colSpan: headers.length, styles: { fillColor: [220, 220, 220], fontStyle: 'bold' } }
    ]);

    // Trier les enfants par nom puis prénom
    const sortedChildren = classData.children.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    // Ajouter les données pour chaque enfant
    sortedChildren.forEach(child => {
      const row = [
        child.lastName,
        child.firstName,
        child.schoolClass
      ];

      // Ajouter le statut pour chaque date avec pictogrammes
      dates.forEach(date => {
        const status = child.reservations.get(date) || "-";
        let displayStatus = status;
        
        // Remplacer les textes par des pictogrammes
        if (status === "Avec repas") {
          displayStatus = MEAL_SYMBOLS.WITH_MEAL;
        } else if (status === "Sans repas") {
          displayStatus = MEAL_SYMBOLS.WITHOUT_MEAL;
        }
        
        row.push(displayStatus);
        
        // Incrémenter le total pour cette date si l'enfant est réservé
        if (status !== "-") {
          totals.set(date, totals.get(date)! + 1);
        }
      });

      allTableData.push(row);
    });

    // Ajouter le sous-total pour la classe
    const classTotals = [`Sous-total`, "", className];
    dates.forEach(date => {
      let total = 0;
      classData.children.forEach(child => {
        if (child.reservations.get(date)) {
          total++;
        }
      });
      classTotals.push(total.toString());
    });
    allTableData.push(classTotals);
    
    // Ligne vide entre classes
    allTableData.push([{ content: "", colSpan: headers.length }]);
  });

  // Ajouter les totaux globaux
  const globalTotals = ["TOTAL", "", ""];
  dates.forEach(date => {
    globalTotals.push(totals.get(date)!.toString());
  });
  
  // Ligne de séparation avant le total
  allTableData.push([
    { content: "", colSpan: headers.length, styles: { fillColor: [200, 200, 200] } }
  ]);
  
  // Ligne de total
  allTableData.push(globalTotals);

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: allTableData,
    startY: 25,
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
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { halign: 'center' }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    // Personnalisation des lignes
    didParseCell: function(data) {
      // Mettre en évidence les lignes de sous-totaux
      if (data.row.raw && 
          data.row.raw[0] && 
          typeof data.row.raw[0] === 'string' && 
          data.row.raw[0].includes('Sous-total')) {
        data.cell.styles.fillColor = [240, 240, 240];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Mettre en évidence les lignes de totaux
      if (data.row.raw && 
          data.row.raw[0] === 'TOTAL') {
        data.cell.styles.fillColor = [220, 220, 220];
        data.cell.styles.fontStyle = 'bold';
      }
      
      // Centrer les pictogrammes de repas
      if (data.row.section === 'body' && 
          data.column.index >= 3 &&
          (data.cell.raw === MEAL_SYMBOLS.WITH_MEAL || data.cell.raw === MEAL_SYMBOLS.WITHOUT_MEAL)) {
        data.cell.styles.halign = 'center';
      }
    }
  });

  doc.save("reservations.pdf");
};
