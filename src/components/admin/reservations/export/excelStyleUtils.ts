
import * as XLSX from "xlsx";
import { MEAL_ABBREVIATIONS } from "./constants";

export const createDefaultStyle = () => ({
  border: {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
    left: { style: 'thin', color: { rgb: '000000' } },
    right: { style: 'thin', color: { rgb: '000000' } }
  }
});

export const createHeaderStyle = (defaultStyle: any) => ({
  ...defaultStyle,
  fill: { patternType: 'solid', fgColor: { rgb: '2980B9' } },
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  alignment: { horizontal: 'center', vertical: 'center' }
});

export const createTotalStyle = (defaultStyle: any) => ({
  ...defaultStyle,
  fill: { patternType: 'solid', fgColor: { rgb: 'DDDDDD' } },
  font: { bold: true },
  alignment: { horizontal: 'center', vertical: 'center' }
});

export const createClassHeaderStyle = (defaultStyle: any) => ({
  ...defaultStyle,
  fill: { patternType: 'solid', fgColor: { rgb: 'CCCCCC' } },
  font: { bold: true },
  alignment: { horizontal: 'center', vertical: 'center' }
});

export const createSubtotalStyle = (defaultStyle: any) => ({
  ...defaultStyle,
  font: { bold: true },
  alignment: { horizontal: 'center', vertical: 'center' }
});

export const createDataCellStyle = (defaultStyle: any, cellValue: any, col: number) => {
  const shouldCenter = col >= 3 && (
    cellValue === MEAL_ABBREVIATIONS.WITH_MEAL || 
    cellValue === MEAL_ABBREVIATIONS.WITHOUT_MEAL ||
    (typeof cellValue === 'string' && cellValue.includes('AM '))
  );
  
  return {
    ...defaultStyle,
    font: { bold: col <= 1 },
    alignment: { 
      horizontal: shouldCenter ? 'center' : (col <= 1 ? 'left' : 'center'),
      vertical: 'center' 
    }
  };
};

export const applyWorksheetStyles = (ws: XLSX.WorkSheet, excelRows: any[], dates: string[]) => {
  const defaultStyle = createDefaultStyle();
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');

  // Apply default borders to all cells
  ws['!borders'] = {};
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      ws[cellRef] = ws[cellRef] || { v: '', t: 's' };
      ws[cellRef].s = { ...defaultStyle };
    }
  }
  
  // Apply header styles
  for (let col = 0; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[headerCell]) {
      ws[headerCell].s = createHeaderStyle(defaultStyle);
    }
  }

  // Apply row-specific styles
  excelRows.forEach((row, index) => {
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: index, c: col });
      if (!ws[cellRef]) continue;

      if (row.Nom === 'TOTAL' || row.Nom === 'Accueil avant 8h30' || row.Nom === 'Sans Repas') {
        ws[cellRef].s = createTotalStyle(defaultStyle);
      } else if (row.Nom && row.Nom.startsWith('Classe:')) {
        ws[cellRef].s = createClassHeaderStyle(defaultStyle);
      } else if (row.Nom === 'Sous-total') {
        ws[cellRef].s = createSubtotalStyle(defaultStyle);
      } else {
        const cellValue = ws[cellRef].v;
        ws[cellRef].s = createDataCellStyle(defaultStyle, cellValue, col);
      }
    }
  });

  // Set column widths
  const colWidths = [
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    ...dates.map(() => ({ wch: 12 }))
  ];
  ws['!cols'] = colWidths;
};
