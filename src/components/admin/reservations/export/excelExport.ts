
import * as XLSX from "xlsx";
import { ExportData } from "./types";
import { formatDate } from "./utils";
import { MEAL_ABBREVIATIONS } from "./constants";
import { schoolClassToFrontendCategory } from "@/utils/categoryTranslationUtils";

// Fonction pour définir l'ordre chronologique des classes (même que dans tableDataProcessor)
const getClassOrder = (className: string): number => {
  const classOrderMap: { [key: string]: number } = {
    // Maternelles
    "PS": 1,
    "PETITE SECTION": 1,
    "MS": 2,
    "MOYENNE SECTION": 2,
    "GS": 3,
    "GRANDE SECTION": 3,
    
    // Primaires
    "CP": 4,
    "CE1": 5,
    "CE2": 6,
    "CM1": 7,
    "CM2": 8,
    
    // Collège
    "6ÈME": 9,
    "6EME": 9,
    "5ÈME": 10,
    "5EME": 10,
    "4ÈME": 11,
    "4EME": 11,
    "3ÈME": 12,
    "3EME": 12,
    
    // Lycée
    "SECONDE": 13,
    "PREMIÈRE": 14,
    "PREMIERE": 14,
    "TERMINALE": 15
  };

  const normalizedClass = className.trim().toUpperCase();
  return classOrderMap[normalizedClass] || 999;
};

export const exportToExcel = (exportData: ExportData) => {
  const { dates, childrenByClass } = exportData;
  
  const headers = [
    "Nom",
    "Prénom",
    "Classe",
    ...dates.map(date => formatDate(date, true)) // Utiliser le format court
  ];

  let excelRows: any[] = [];
  const totals = new Map<string, number>();
  const totalsEarlyAccess = new Map<string, number>();
  const totalsWithoutMeal = new Map<string, number>();
  
  dates.forEach(date => {
    totals.set(date, 0);
    totalsEarlyAccess.set(date, 0);
    totalsWithoutMeal.set(date, 0);
  });

  // Trier les classes par ordre chronologique (même logique que le PDF)
  const sortedClasses = Array.from(childrenByClass.keys()).sort((a, b) => {
    const orderA = getClassOrder(a);
    const orderB = getClassOrder(b);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.localeCompare(b);
  });

  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    excelRows.push({
      Nom: `Classe: ${className}`,
      Prénom: "",
      Classe: "",
      ...Object.fromEntries(dates.map(date => [
        formatDate(date, true),
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
        const formattedDate = formatDate(date, true);
        const reservationData = child.reservations.get(date);
        let displayStatus = "-";
        
        if (reservationData) {
          const { status, early_dropoff, without_meal } = reservationData;
          
          // Vérifier si c'est un adolescent ou CM2
          const isTeenClass = schoolClassToFrontendCategory(child.schoolClass) === 'adolescent';
          const isCM2Class = child.schoolClass.trim().toUpperCase() === 'CM2';
          
          // Pour les adolescents et CM2, c'est systématiquement SR
          if (isTeenClass || isCM2Class) {
            displayStatus = MEAL_ABBREVIATIONS.WITHOUT_MEAL;
          } else {
            // Pour les autres classes, utiliser la logique normale
            if (status === "Avec repas") {
              displayStatus = MEAL_ABBREVIATIONS.WITH_MEAL;
            } else if (status === "Sans repas") {
              displayStatus = MEAL_ABBREVIATIONS.WITHOUT_MEAL;
            } else {
              displayStatus = status;
            }
          }
          
          // Ajouter l'abréviation AM si arrivée avant 8h30
          if (early_dropoff) {
            displayStatus = `AM ${displayStatus}`;
          }
          
          // Incrémenter les totaux pour cette date
          totals.set(date, totals.get(date)! + 1);
          
          // Compter l'accueil matinal si early_dropoff est true
          if (early_dropoff) {
            totalsEarlyAccess.set(date, totalsEarlyAccess.get(date)! + 1);
          }
          
          // Compter les "Sans repas" si without_meal est true OU si c'est un adolescent OU si c'est CM2
          if (without_meal || isTeenClass || isCM2Class) {
            totalsWithoutMeal.set(date, totalsWithoutMeal.get(date)! + 1);
          }
        }
        
        row[formattedDate] = displayStatus;
      });

      excelRows.push(row);
    });

    // Ajouter les sous-totaux pour la classe
    const classTotals: any = {
      Nom: "Sous-total",
      Prénom: "",
      Classe: className
    };

    const classEarlyAccess: any = {
      Nom: "Accueil avant 8h30",
      Prénom: "",
      Classe: className
    };

    const classWithoutMeal: any = {
      Nom: "Sans Repas",
      Prénom: "",
      Classe: className
    };

    dates.forEach(date => {
      const formattedDate = formatDate(date, true);
      let total = 0;
      let earlyAccess = 0;
      let withoutMeal = 0;
      
      classData.children.forEach(child => {
        const reservationData = child.reservations.get(date);
        if (reservationData) {
          total++;
          // Compter l'accueil matinal si early_dropoff est true
          if (reservationData.early_dropoff) {
            earlyAccess++;
          }
          // Compter les "Sans repas" si without_meal est true OU si c'est un adolescent OU si c'est CM2
          const isTeenClass = schoolClassToFrontendCategory(child.schoolClass) === 'adolescent';
          const isCM2Class = child.schoolClass.trim().toUpperCase() === 'CM2';
          if (reservationData.without_meal || isTeenClass || isCM2Class) {
            withoutMeal++;
          }
        }
      });
      
      classTotals[formattedDate] = total;
      classEarlyAccess[formattedDate] = earlyAccess;
      classWithoutMeal[formattedDate] = withoutMeal;
    });
    
    excelRows.push(classTotals);
    excelRows.push(classEarlyAccess);
    excelRows.push(classWithoutMeal);
    
    excelRows.push({
      Nom: "",
      Prénom: "",
      Classe: "",
      ...Object.fromEntries(dates.map(date => [formatDate(date, true), ""]))
    });
  });

  excelRows.push({
    Nom: "",
    Prénom: "",
    Classe: "",
    ...Object.fromEntries(dates.map(date => [formatDate(date, true), ""]))
  });

  // Totaux globaux
  const globalTotals: any = {
    Nom: "TOTAL",
    Prénom: "",
    Classe: ""
  };

  const globalEarlyAccess: any = {
    Nom: "Accueil avant 8h30",
    Prénom: "",
    Classe: ""
  };

  const globalWithoutMeal: any = {
    Nom: "Sans Repas",
    Prénom: "",
    Classe: ""
  };

  dates.forEach(date => {
    const formattedDate = formatDate(date, true);
    globalTotals[formattedDate] = totals.get(date);
    globalEarlyAccess[formattedDate] = totalsEarlyAccess.get(date);
    globalWithoutMeal[formattedDate] = totalsWithoutMeal.get(date);
  });
  
  excelRows.push(globalTotals);
  excelRows.push(globalEarlyAccess);
  excelRows.push(globalWithoutMeal);

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

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z1000');

  ws['!borders'] = {};
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      ws[cellRef] = ws[cellRef] || { v: '', t: 's' };
      ws[cellRef].s = {
        ...defaultStyle
      };
    }
  }
  
  for (let col = 0; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[headerCell]) {
      ws[headerCell].s = {
        ...defaultStyle,
        fill: { patternType: 'solid', fgColor: { rgb: '2980B9' } },
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  }

  excelRows.forEach((row, index) => {
    for (let col = 0; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: index, c: col });
      if (!ws[cellRef]) continue;

      if (row.Nom === 'TOTAL' || row.Nom === 'Accueil avant 8h30' || row.Nom === 'Sans Repas') {
        ws[cellRef].s = {
          ...defaultStyle,
          fill: { patternType: 'solid', fgColor: { rgb: 'DDDDDD' } },
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      } else if (row.Nom && row.Nom.startsWith('Classe:')) {
        ws[cellRef].s = {
          ...defaultStyle,
          fill: { patternType: 'solid', fgColor: { rgb: 'CCCCCC' } },
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      } else if (row.Nom === 'Sous-total') {
        ws[cellRef].s = {
          ...defaultStyle,
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      } else {
        // Centrer les abréviations dans les cellules de données
        const cellValue = ws[cellRef].v;
        const shouldCenter = col >= 3 && (
          cellValue === MEAL_ABBREVIATIONS.WITH_MEAL || 
          cellValue === MEAL_ABBREVIATIONS.WITHOUT_MEAL ||
          (typeof cellValue === 'string' && cellValue.includes('AM '))
        );
        
        ws[cellRef].s = {
          ...defaultStyle,
          font: { bold: col <= 1 },
          alignment: { 
            horizontal: shouldCenter ? 'center' : (col <= 1 ? 'left' : 'center'),
            vertical: 'center' 
          }
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
