
import { ExportData } from "./types";
import { formatDate } from "./utils";
import { MEAL_ABBREVIATIONS } from "./constants";
import { schoolClassToFrontendCategory } from "@/utils/categoryTranslationUtils";
import { sortClassesByOrder } from "./classOrderUtils";

export const createExcelHeaders = (dates: string[]) => [
  "Nom",
  "Prénom",
  "Classe",
  ...dates.map(date => formatDate(date, true))
];

export const initializeTotals = (dates: string[]) => {
  const totals = new Map<string, number>();
  const totalsEarlyAccess = new Map<string, number>();
  const totalsWithoutMeal = new Map<string, number>();
  
  dates.forEach(date => {
    totals.set(date, 0);
    totalsEarlyAccess.set(date, 0);
    totalsWithoutMeal.set(date, 0);
  });

  return { totals, totalsEarlyAccess, totalsWithoutMeal };
};

export const getDisplayStatus = (child: any, date: string, reservationData: any) => {
  const { status, early_dropoff, without_meal } = reservationData;
  
  // Vérifier si c'est un adolescent ou CM2
  const isTeenClass = schoolClassToFrontendCategory(child.schoolClass) === 'adolescent';
  const isCM2Class = child.schoolClass.trim().toUpperCase() === 'CM2';
  
  let displayStatus: string;
  
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
  
  return displayStatus;
};

export const updateTotals = (
  child: any,
  date: string,
  reservationData: any,
  totals: Map<string, number>,
  totalsEarlyAccess: Map<string, number>,
  totalsWithoutMeal: Map<string, number>
) => {
  const { early_dropoff, without_meal } = reservationData;
  
  // Incrémenter les totaux pour cette date
  totals.set(date, totals.get(date)! + 1);
  
  // Compter l'accueil matinal si early_dropoff est true
  if (early_dropoff) {
    totalsEarlyAccess.set(date, totalsEarlyAccess.get(date)! + 1);
  }
  
  // Compter les "Sans repas" si without_meal est true OU si c'est un adolescent OU si c'est CM2
  const isTeenClass = schoolClassToFrontendCategory(child.schoolClass) === 'adolescent';
  const isCM2Class = child.schoolClass.trim().toUpperCase() === 'CM2';
  if (without_meal || isTeenClass || isCM2Class) {
    totalsWithoutMeal.set(date, totalsWithoutMeal.get(date)! + 1);
  }
};

export const calculateClassTotals = (classData: any, dates: string[]) => {
  const classTotals: any = { Nom: "Sous-total", Prénom: "", Classe: classData.className };
  const classEarlyAccess: any = { Nom: "Accueil avant 8h30", Prénom: "", Classe: classData.className };
  const classWithoutMeal: any = { Nom: "Sans Repas", Prénom: "", Classe: classData.className };

  dates.forEach(date => {
    const formattedDate = formatDate(date, true);
    let total = 0;
    let earlyAccess = 0;
    let withoutMeal = 0;
    
    classData.children.forEach((child: any) => {
      const reservationData = child.reservations.get(date);
      if (reservationData) {
        total++;
        if (reservationData.early_dropoff) {
          earlyAccess++;
        }
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
  
  return { classTotals, classEarlyAccess, classWithoutMeal };
};

export const createGlobalTotals = (
  dates: string[],
  totals: Map<string, number>,
  totalsEarlyAccess: Map<string, number>,
  totalsWithoutMeal: Map<string, number>
) => {
  const globalTotals: any = { Nom: "TOTAL", Prénom: "", Classe: "" };
  const globalEarlyAccess: any = { Nom: "Accueil avant 8h30", Prénom: "", Classe: "" };
  const globalWithoutMeal: any = { Nom: "Sans Repas", Prénom: "", Classe: "" };

  dates.forEach(date => {
    const formattedDate = formatDate(date, true);
    globalTotals[formattedDate] = totals.get(date);
    globalEarlyAccess[formattedDate] = totalsEarlyAccess.get(date);
    globalWithoutMeal[formattedDate] = totalsWithoutMeal.get(date);
  });
  
  return { globalTotals, globalEarlyAccess, globalWithoutMeal };
};

export const prepareExcelRows = (exportData: ExportData) => {
  const { dates, childrenByClass } = exportData;
  let excelRows: any[] = [];
  const { totals, totalsEarlyAccess, totalsWithoutMeal } = initializeTotals(dates);

  const sortedClasses = sortClassesByOrder(Array.from(childrenByClass.keys()));

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
          displayStatus = getDisplayStatus(child, date, reservationData);
          updateTotals(child, date, reservationData, totals, totalsEarlyAccess, totalsWithoutMeal);
        }
        
        row[formattedDate] = displayStatus;
      });

      excelRows.push(row);
    });

    // Ajouter les sous-totaux pour la classe
    const { classTotals, classEarlyAccess, classWithoutMeal } = calculateClassTotals(
      { ...classData, className }, 
      dates
    );
    
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
  const { globalTotals, globalEarlyAccess, globalWithoutMeal } = createGlobalTotals(
    dates, totals, totalsEarlyAccess, totalsWithoutMeal
  );
  
  excelRows.push(globalTotals);
  excelRows.push(globalEarlyAccess);
  excelRows.push(globalWithoutMeal);

  return excelRows;
};
