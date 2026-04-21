import { ExportData } from "./types";
import { MEAL_ABBREVIATIONS } from "./constants";
import { schoolClassToFrontendCategory } from "@/utils/categoryTranslationUtils";
import { sortClassesByOrder } from "./classOrderUtils";

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
  const sortedClasses = sortClassesByOrder(Array.from(childrenByClass.keys()));

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

          // Utiliser la valeur réelle de la réservation
          if (without_meal || status === "Sans repas") {
            displayStatus = MEAL_ABBREVIATIONS.WITHOUT_MEAL;
          } else if (status === "Avec repas") {
            displayStatus = MEAL_ABBREVIATIONS.WITH_MEAL;
          } else {
            displayStatus = status;
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
          
          // Compter les "Sans repas" uniquement si la réservation l'indique
          if (without_meal) {
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
          // Compter les "Sans repas" uniquement si la réservation l'indique
          if (reservationData.without_meal) {
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
