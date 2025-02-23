
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToPdf } from "./export/pdfExport";
import { exportToExcel } from "./export/excelExport";
import { prepareExportData } from "./export/utils";
import { ExportButtonsProps } from "./export/types";

export const ExportButtons = ({
  wednesdayReservations,
  holidayReservations,
  startDate,
  endDate
}: ExportButtonsProps) => {
  const handlePdfExport = () => {
    const exportData = prepareExportData(wednesdayReservations, holidayReservations);
    exportToPdf(exportData, startDate, endDate);
  };

  const handleExcelExport = () => {
    const exportData = prepareExportData(wednesdayReservations, holidayReservations);
    exportToExcel(exportData);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={handlePdfExport}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={handleExcelExport}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
};
