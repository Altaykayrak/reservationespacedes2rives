
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

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');
  excelRows.forEach((row, index) => {
    if (row.Nom.startsWith('Classe:') || row.Nom === 'TOTAL GLOBAL') {
      for (let col = 0; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: index, c: col });
        if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
        ws[cellRef].s = {
          fill: { fgColor: { rgb: row.Nom === 'TOTAL GLOBAL' ? 'DDDDDD' : 'CCCCCC' } },
          font: { bold: true }
        };
      }
    }
  });

  const colWidths = [
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    ...dates.map(() => ({ wch: 12 }))
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Réservations");
  XLSX.writeFile(wb, "reservations.xlsx");
};
