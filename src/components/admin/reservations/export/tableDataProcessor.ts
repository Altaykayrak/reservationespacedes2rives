
import { ExportData } from "./types";
import { MEAL_ABBREVIATIONS } from "./constants";

export const prepareTableData = (exportData: ExportData) => {
  const { dates, childrenByClass } = exportData;
  
  let allTableData: any[] = [];
  
  // Map pour calculer les totaux par date
  const totals = new Map<string, number>();
  dates.forEach(date => {
    totals.set(date, 0);
  });

  // Trier les classes
  const sortedClasses = Array.from(childrenByClass.keys()).sort();

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

      // Ajouter le statut pour chaque date avec abréviations
      dates.forEach(date => {
        const status = child.reservations.get(date) || "-";
        let displayStatus = status;
        
        // Remplacer les textes par des abréviations
        if (status === "Avec repas") {
          displayStatus = MEAL_ABBREVIATIONS.WITH_MEAL;
        } else if (status === "Sans repas") {
          displayStatus = MEAL_ABBREVIATIONS.WITHOUT_MEAL;
        }
        
        row.push(displayStatus);
        
        // Incrémenter le total pour cette date si l'enfant est réservé
        if (status !== "-") {
          totals.set(date, totals.get(date)! + 1);
        }
      });

      allTableData.push(row);
    });

    // Ajouter le sous-total pour la classe
    const classTotals = [`Sous-total`, "", className];
    dates.forEach(date => {
      let total = 0;
      classData.children.forEach(child => {
        if (child.reservations.get(date)) {
          total++;
        }
      });
      classTotals.push(total.toString());
    });
    allTableData.push(classTotals);
    
    // Ligne vide entre classes
    allTableData.push([{ content: "", colSpan: dates.length + 3 }]);
  });

  // Ajouter les totaux globaux
  const globalTotals = ["TOTAL", "", ""];
  dates.forEach(date => {
    globalTotals.push(totals.get(date)!.toString());
  });
  
  // Ligne de séparation avant le total
  allTableData.push([
    { content: "", colSpan: dates.length + 3, styles: { fillColor: [200, 200, 200] } }
  ]);
  
  // Ligne de total
  allTableData.push(globalTotals);

  return allTableData;
};
