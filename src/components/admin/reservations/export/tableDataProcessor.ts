
import { ExportData } from "./types";
import { MEAL_ABBREVIATIONS } from "./constants";
import { schoolClassToFrontendCategory } from "@/utils/categoryTranslationUtils";

// Fonction pour définir l'ordre chronologique des classes
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
  return classOrderMap[normalizedClass] || 999; // Classes non reconnues à la fin
};

export const prepareTableData = (exportData: ExportData) => {
  const { dates, childrenByClass } = exportData;
  
  let allTableData: any[] = [];
  
  // Map pour calculer les totaux par date
  const totals = new Map<string, number>();
  const totalsEarlyAccess = new Map<string, number>();
  const totalsWithoutMeal = new Map<string, number>();
  
  dates.forEach(date => {
    totals.set(date, 0);
    totalsEarlyAccess.set(date, 0);
    totalsWithoutMeal.set(date, 0);
  });

  // Trier les classes par ordre chronologique
  const sortedClasses = Array.from(childrenByClass.keys()).sort((a, b) => {
    const orderA = getClassOrder(a);
    const orderB = getClassOrder(b);
    
    // Si les ordres sont différents, trier par ordre chronologique
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Si les ordres sont identiques (cas des classes non reconnues), trier alphabétiquement
    return a.localeCompare(b);
  });

  // Traiter chaque classe
  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    // Ajouter l'en-tête de classe
    allTableData.push([
      { content: `Classe: ${className}`, colSpan: dates.length + 3, styles: { fillColor: [220, 220, 220], fontStyle: 'bold' } }
    ]);

    // Trier les enfants par nom puis prénom
    const sortedChildren = classData.children.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });

    // Ajouter les données pour chaque enfant
    sortedChildren.forEach(child => {
      const row = [
        child.lastName,
        child.firstName,
        child.schoolClass
      ];

      // Ajouter le statut pour chaque date avec abréviations et AM
      dates.forEach(date => {
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
        
        row.push(displayStatus);
      });

      allTableData.push(row);
    });

    // Ajouter le sous-total pour la classe
    const classTotals = [`Sous-total`, "", className];
    const classEarlyAccess = [`Accueil avant 8h30`, "", className];
    const classWithoutMeal = [`Sans Repas`, "", className];
    
    dates.forEach(date => {
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
      
      classTotals.push(total.toString());
      classEarlyAccess.push(earlyAccess.toString());
      classWithoutMeal.push(withoutMeal.toString());
    });
    
    allTableData.push(classTotals);
    allTableData.push(classEarlyAccess);
    allTableData.push(classWithoutMeal);
    
    // Ligne vide entre classes
    allTableData.push([{ content: "", colSpan: dates.length + 3 }]);
  });

  // Ajouter les totaux globaux
  const globalTotals = ["TOTAL", "", ""];
  const globalEarlyAccess = ["Accueil avant 8h30", "", ""];
  const globalWithoutMeal = ["Sans Repas", "", ""];
  
  dates.forEach(date => {
    globalTotals.push(totals.get(date)!.toString());
    globalEarlyAccess.push(totalsEarlyAccess.get(date)!.toString());
    globalWithoutMeal.push(totalsWithoutMeal.get(date)!.toString());
  });
  
  // Ligne de séparation avant les totaux
  allTableData.push([
    { content: "", colSpan: dates.length + 3, styles: { fillColor: [200, 200, 200] } }
  ]);
  
  // Lignes de totaux
  allTableData.push(globalTotals);
  allTableData.push(globalEarlyAccess);
  allTableData.push(globalWithoutMeal);

  return allTableData;
};
