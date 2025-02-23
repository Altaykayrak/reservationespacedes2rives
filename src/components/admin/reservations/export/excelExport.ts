
import * as XLSX from "xlsx";
import { ExportData } from "./types";
import { formatDate } from "./utils";

export const exportToExcel = (exportData: ExportData) => {
  const { dates, childrenByClass } = exportData;
  
  const headers = [
    "Nom",
    "Prénom",
    "Classe",
    ...dates.map(date => formatDate(date))
  ];

  let excelRows: any[] = [];
  const totals = new Map<string, number>();
  
  dates.forEach(date => {
    totals.set(date, 0);
  });

  const sortedClasses = Array.from(childrenByClass.keys()).sort();
  let currentRow = 1; // Pour suivre la position actuelle dans le fichier Excel

  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    excelRows.push({
      Nom: `Classe: ${className}`,
      Prénom: "",
      Classe: "",
      ...Object.fromEntries(dates.map(date => [
        formatDate(date),
        ""
      ]))
    });

    const sortedChildren = classData.children.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    sortedChildren.forEach(child => {
      const row: any = {
        Nom: child.lastName,
        Prénom: child.firstName,
        Classe: child.schoolClass
      };

      dates.forEach(date => {
        const formattedDate = formatDate(date);
        const status = child.reservations.get(date) || "-";
        row[formattedDate] = status;
        
        if (status !== "-") {
          totals.set(date, totals.get(date)! + 1);
        }
      });

      excelRows.push(row);
    });

    const classTotals: any = {
      Nom: "Sous-total",
      Prénom: "",
      Classe: className
    };

    dates.forEach(date => {
      const formattedDate = formatDate(date);
      let total = 0;
      classData.children.forEach(child => {
        if (child.reservations.get(date)) {
          total++;
        }
      });
      classTotals[formattedDate] = total;
    });
    excelRows.push(classTotals);
    
    excelRows.push({
      Nom: "",
      Prénom: "",
      Classe: "",
      ...Object.fromEntries(dates.map(date => [formatDate(date), ""]))
    });
  });

  excelRows.push({
    Nom: "",
    Prénom: "",
    Classe: "",
    ...Object.fromEntries(dates.map(date => [formatDate(date), ""]))
  });

  const globalTotals: any = {
    Nom: "TOTAL GLOBAL",
    Prénom: "",
    Classe: ""
  };

  dates.forEach(date => {
    const formattedDate = formatDate(date);
    globalTotals[formattedDate] = totals.get(date);
  });
  excelRows.push(globalTotals);

  const ws = XLSX.utils.json_to_sheet(excelRows);

  // Définir les styles par défaut pour toutes les cellules
  const defaultStyle = {
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  };

  // Appliquer les styles aux cellules
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');
  
  // Style pour l'en-tête
  for (let col = 0; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    ws[headerCell].s = {
      ...defaultStyle,
      fill: { fgColor: { rgb: '2980B9' } }, // Bleu similaire au PDF
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center' }
    };
  }

  // Style pour le reste des cellules
  excelRows.forEach((row, index) => {
    const rowNum = index;
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: col });
      if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };

      if (row.Nom === 'TOTAL GLOBAL') {
        ws[cellRef].s = {
          ...defaultStyle,
          fill: { fgColor: { rgb: 'DDDDDD' } },
          font: { bold: true }
        };
      } else if (row.Nom.startsWith('Classe:')) {
        ws[cellRef].s = {
          ...defaultStyle,
          fill: { fgColor: { rgb: 'CCCCCC' } },
          font: { bold: true }
        };
      } else if (row.Nom === 'Sous-total') {
        ws[cellRef].s = {
          ...defaultStyle,
          font: { bold: true }
        };
      } else {
        ws[cellRef].s = {
          ...defaultStyle,
          font: { bold: col <= 1 } // Nom et Prénom en gras
        };
      }
    }
  });

  const colWidths = [
    { wch: 15 },  // Nom
    { wch: 15 },  // Prénom
    { wch: 10 },  // Classe
    ...dates.map(() => ({ wch: 12 }))  // Dates
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Réservations");
  XLSX.writeFile(wb, "reservations.xlsx");
};
