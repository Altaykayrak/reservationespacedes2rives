
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ExportData } from "./types";
import { formatDate } from "./utils";

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

  const title = `Réservations du ${startDate || "début"} au ${endDate || "fin"}`;
  doc.text(title, 14, 15);

  const headers = [
    "Nom",
    "Prénom",
    "Classe",
    ...dates.map(date => formatDate(date))
  ];

  let allTableData: any[] = [];
  const totals = new Map<string, number>();
  
  dates.forEach(date => {
    totals.set(date, 0);
  });

  const sortedClasses = Array.from(childrenByClass.keys()).sort();

  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    allTableData.push([
      { content: `Classe: ${className}`, colSpan: headers.length, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }
    ]);

    const sortedChildren = classData.children.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    sortedChildren.forEach(child => {
      const row = [
        child.lastName,
        child.firstName,
        child.schoolClass
      ];

      dates.forEach(date => {
        const status = child.reservations.get(date) || "-";
        row.push(status);
        
        if (status !== "-") {
          totals.set(date, totals.get(date)! + 1);
        }
      });

      allTableData.push(row);
    });

    const classTotals = ["Sous-total", "", className];
    dates.forEach(date => {
      let total = 0;
      classData.children.forEach(child => {
        if (child.reservations.get(date)) {
          total++;
        }
      });
      classTotals.push(total.toString());
    });
    allTableData.push([...classTotals]);
    
    allTableData.push(Array(headers.length).fill(""));
  });

  const globalTotals = ["TOTAL GLOBAL", "", ""];
  dates.forEach(date => {
    globalTotals.push(totals.get(date)!.toString());
  });
  allTableData.push([
    { content: "", colSpan: headers.length, styles: { fillColor: [220, 220, 220] } }
  ]);
  allTableData.push([...globalTotals]);

  autoTable(doc, {
    head: [headers],
    body: allTableData,
    startY: 25,
    styles: {
      fontSize: 8,
      cellPadding: 1
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { fontStyle: 'bold' }
    }
  });

  doc.save("reservations.pdf");
};
