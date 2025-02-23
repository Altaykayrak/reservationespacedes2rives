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
    const childrenByClass = new Map<string, {
      children: {
        firstName: string;
        lastName: string;
        schoolClass: string;
        reservations: Map<string, string>;
      }[];
    }>();

    const addChildToClass = (
      child: {
        first_name: string;
        last_name: string;
        school_class: string;
      },
      date: string,
      withoutMeal: boolean
    ) => {
      const schoolClass = child.school_class;
      const classData = childrenByClass.get(schoolClass) || { children: [] };
      
      let childData = classData.children.find(
        c => c.firstName === child.first_name && c.lastName === child.last_name
      );
      
      if (!childData) {
        childData = {
          firstName: child.first_name,
          lastName: child.last_name,
          schoolClass: child.school_class,
          reservations: new Map<string, string>()
        };
        classData.children.push(childData);
      }
      
      childData.reservations.set(date, withoutMeal ? "Sans repas" : "Avec repas");
      childrenByClass.set(schoolClass, classData);
    };

    wednesdayReservations?.forEach(res => {
      addChildToClass(
        res.children,
        res.available_wednesdays.date,
        res.without_meal
      );
    });

    holidayReservations?.forEach(res => {
      addChildToClass(
        res.children,
        res.reservation_date,
        res.without_meal
      );
    });

    return { dates, childrenByClass };
  };

  const handlePdfExport = () => {
    const { dates, childrenByClass } = prepareDataForPdf();
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
      ...dates.map(date => format(new Date(date), "EEE dd MMM", { locale: fr }))
    ];

    let allTableData: any[] = [];
    const totals = new Map<string, { withMeal: number; withoutMeal: number }>();
    
    dates.forEach(date => {
      totals.set(date, { withMeal: 0, withoutMeal: 0 });
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
          
          if (status === "Avec repas" || status === "Sans repas") {
            const dateTotal = totals.get(date)!;
            if (status === "Avec repas") {
              dateTotal.withMeal++;
            } else {
              dateTotal.withoutMeal++;
            }
            totals.set(date, dateTotal);
          }
        });

        allTableData.push(row);
      });

      const classTotals = ["Sous-total", "", className];
      dates.forEach(date => {
        let withMeal = 0;
        let withoutMeal = 0;
        classData.children.forEach(child => {
          const status = child.reservations.get(date);
          if (status === "Avec repas") withMeal++;
          if (status === "Sans repas") withoutMeal++;
        });
        classTotals.push(`AR: ${withMeal} / SR: ${withoutMeal}`);
      });
      allTableData.push([...classTotals]);
      
      allTableData.push(Array(headers.length).fill(""));
    });

    const globalTotals = ["TOTAL GLOBAL", "", ""];
    dates.forEach(date => {
      const dateTotal = totals.get(date)!;
      globalTotals.push(`AR: ${dateTotal.withMeal} / SR: ${dateTotal.withoutMeal}`);
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

  const handleExcelExport = () => {
    const { dates, childrenByClass } = prepareDataForPdf();
    
    const excelData = Array.from(childrenByClass.values()).map(child => {
      const row: any = {
        "Nom": child.children[0].lastName,
        "Prénom": child.children[0].firstName,
        "Classe": child.children[0].schoolClass
      };

      dates.forEach(date => {
        const formattedDate = format(new Date(date), "EEE dd MMM", { locale: fr });
        row[formattedDate] = child.children[0].reservations.get(date) || "-";
      });

      return row;
    });

    excelData.sort((a, b) => {
      const lastNameCompare = a["Nom"].localeCompare(b["Nom"]);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a["Prénom"].localeCompare(b["Prénom"]);
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Réservations");
    
    const colWidths = [
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      ...dates.map(() => ({ wch: 12 }))
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
