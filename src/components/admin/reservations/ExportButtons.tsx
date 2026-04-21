
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToPdf } from "./export/pdfExport";
import { exportToExcel } from "./export/excelExport";
import { prepareExportData } from "./export/utils";
import { ExportButtonsProps } from "./export/types";
import { ExcelFilterDialog } from "./export/ExcelFilterDialog";

export const ExportButtons = ({
  wednesdayReservations,
  holidayReservations,
  startDate,
  endDate,
  selectedGroup
}: ExportButtonsProps) => {
  const exportData = prepareExportData(wednesdayReservations, holidayReservations);

  const handlePdfExport = () => {
    exportToPdf(exportData, startDate, endDate, selectedGroup);
  };

  const handleExcelExport = () => {
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
      <ExcelFilterDialog exportData={exportData} />
    </div>
  );
};
