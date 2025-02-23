
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

interface ExportButtonsProps {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  startDate: string;
  endDate: string;
}

export const ExportButtons = ({
  wednesdayReservations,
  holidayReservations,
  startDate,
  endDate
}: ExportButtonsProps) => {
  const getAllDates = () => {
    const dates = new Set<string>();
    
    wednesdayReservations?.forEach(res => {
      dates.add(res.available_wednesdays.date);
    });
    
    holidayReservations?.forEach(res => {
      dates.add(res.reservation_date);
    });
    
    return Array.from(dates).sort();
  };

  const prepareData = () => {
    const dates = getAllDates();
    const allReservations = new Map<string, { withMeal: number; withoutMeal: number }>();
    
    // Initialiser les compteurs pour chaque date
    dates.forEach(date => {
      allReservations.set(date, { withMeal: 0, withoutMeal: 0 });
    });

    // Compter les réservations du mercredi
    wednesdayReservations?.forEach(res => {
      const date = res.available_wednesdays.date;
      const current = allReservations.get(date) || { withMeal: 0, withoutMeal: 0 };
      
      if (res.without_meal) {
        current.withoutMeal++;
      } else {
        current.withMeal++;
      }
      
      allReservations.set(date, current);
    });

    // Compter les réservations des vacances
    holidayReservations?.forEach(res => {
      const date = res.reservation_date;
      const current = allReservations.get(date) || { withMeal: 0, withoutMeal: 0 };
      
      if (res.without_meal) {
        current.withoutMeal++;
      } else {
        current.withMeal++;
      }
      
      allReservations.set(date, current);
    });

    return { dates, allReservations };
  };

  const handlePdfExport = () => {
    const { dates, allReservations } = prepareData();
    const doc = new jsPDF();

    const title = `Réservations du ${startDate || "début"} au ${endDate || "fin"}`;
    doc.text(title, 14, 15);

    const tableData = dates.map(date => {
      const counts = allReservations.get(date) || { withMeal: 0, withoutMeal: 0 };
      const formattedDate = format(new Date(date), "dd MMMM yyyy", { locale: fr });
      return [
        formattedDate,
        counts.withMeal.toString(),
        counts.withoutMeal.toString(),
        (counts.withMeal + counts.withoutMeal).toString()
      ];
    });

    (doc as any).autoTable({
      head: [["Date", "Avec Repas", "Sans Repas", "Total"]],
      body: tableData,
      startY: 25,
    });

    doc.save("reservations.pdf");
  };

  const handleExcelExport = () => {
    const { dates, allReservations } = prepareData();
    
    const excelData = dates.map(date => {
      const counts = allReservations.get(date) || { withMeal: 0, withoutMeal: 0 };
      const formattedDate = format(new Date(date), "dd MMMM yyyy", { locale: fr });
      return {
        "Date": formattedDate,
        "Avec Repas": counts.withMeal,
        "Sans Repas": counts.withoutMeal,
        "Total": counts.withMeal + counts.withoutMeal
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Réservations");
    
    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 20 }, // Date
      { wch: 15 }, // Avec Repas
      { wch: 15 }, // Sans Repas
      { wch: 15 }, // Total
    ];
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, "reservations.xlsx");
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
