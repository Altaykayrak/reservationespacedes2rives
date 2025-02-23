
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
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

  const prepareDataForPdf = () => {
    const dates = getAllDates();
    const allChildren = new Map<string, {
      firstName: string;
      lastName: string;
      schoolClass: string;
      reservations: Map<string, string>;
    }>();

    // Traiter les réservations du mercredi
    wednesdayReservations?.forEach(res => {
      const childKey = `${res.children.last_name}-${res.children.first_name}-${res.child_id}`;
      const child = allChildren.get(childKey) || {
        firstName: res.children.first_name,
        lastName: res.children.last_name,
        schoolClass: res.children.school_class,
        reservations: new Map<string, string>()
      };

      child.reservations.set(
        res.available_wednesdays.date,
        res.without_meal ? "Sans repas" : "Avec repas"
      );

      allChildren.set(childKey, child);
    });

    // Traiter les réservations des vacances
    holidayReservations?.forEach(res => {
      const childKey = `${res.children.last_name}-${res.children.first_name}-${res.child_id}`;
      const child = allChildren.get(childKey) || {
        firstName: res.children.first_name,
        lastName: res.children.last_name,
        schoolClass: res.children.school_class,
        reservations: new Map<string, string>()
      };

      child.reservations.set(
        res.reservation_date,
        res.without_meal ? "Sans repas" : "Avec repas"
      );

      allChildren.set(childKey, child);
    });

    return { dates, allChildren };
  };

  const handlePdfExport = () => {
    const { dates, allChildren } = prepareDataForPdf();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const title = `Réservations du ${startDate || "début"} au ${endDate || "fin"}`;
    doc.text(title, 14, 15);

    // Préparer les en-têtes avec les dates formatées
    const headers = [
      "Nom",
      "Prénom",
      "Classe",
      ...dates.map(date => format(new Date(date), "EEE dd MMM", { locale: fr }))
    ];

    // Préparer les données du tableau
    const tableData = Array.from(allChildren.values()).map(child => {
      const row = [
        child.lastName,
        child.firstName,
        child.schoolClass
      ];

      // Ajouter les réservations pour chaque date
      dates.forEach(date => {
        row.push(child.reservations.get(date) || "-");
      });

      return row;
    });

    // Trier par nom, puis prénom
    tableData.sort((a, b) => {
      const lastNameCompare = a[0].localeCompare(b[0]);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a[1].localeCompare(b[1]);
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
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

  const handleExcelExport = () => {
    const { dates, allChildren } = prepareDataForPdf();
    
    const excelData = Array.from(allChildren.values()).map(child => {
      const row: any = {
        "Nom": child.lastName,
        "Prénom": child.firstName,
        "Classe": child.schoolClass
      };

      // Ajouter les réservations pour chaque date
      dates.forEach(date => {
        const formattedDate = format(new Date(date), "EEE dd MMM", { locale: fr });
        row[formattedDate] = child.reservations.get(date) || "-";
      });

      return row;
    });

    // Trier par nom, puis prénom
    excelData.sort((a, b) => {
      const lastNameCompare = a["Nom"].localeCompare(b["Nom"]);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a["Prénom"].localeCompare(b["Prénom"]);
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Réservations");
    
    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 15 }, // Nom
      { wch: 15 }, // Prénom
      { wch: 10 }, // Classe
      ...dates.map(() => ({ wch: 12 })) // Dates
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
