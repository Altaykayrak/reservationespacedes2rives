
import * as XLSX from "xlsx";
import { ExportData } from "./types";
import { createExcelHeaders, prepareExcelRows } from "./excelDataUtils";
import { applyWorksheetStyles } from "./excelStyleUtils";

export const exportToExcel = (exportData: ExportData) => {
  const { dates } = exportData;
  
  const headers = createExcelHeaders(dates);
  const excelRows = prepareExcelRows(exportData);

  const ws = XLSX.utils.json_to_sheet(excelRows);

  // Appliquer les styles
  applyWorksheetStyles(ws, excelRows, dates);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Réservations");

  wb.Workbook = {
    Views: [{ RTL: false }]
  };

  XLSX.writeFile(wb, "reservations.xlsx", {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary',
    cellStyles: true
  });
};
