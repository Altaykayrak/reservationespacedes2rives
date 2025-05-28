
import { MEAL_ABBREVIATIONS } from "./constants";

export const customizeCell = (data: any) => {
  // Ajouter des bordures à toutes les cellules
  data.cell.styles.lineColor = [0, 0, 0];
  data.cell.styles.lineWidth = 0.1;
  
  // Mettre en évidence les lignes de sous-totaux
  if (data.row.raw && 
      data.row.raw[0] && 
      typeof data.row.raw[0] === 'string' && 
      (data.row.raw[0].includes('Sous-total') || 
       data.row.raw[0] === 'Accueil avant 8h30' || 
       data.row.raw[0] === 'Sans Repas')) {
    data.cell.styles.fillColor = [240, 240, 240];
    data.cell.styles.fontStyle = 'bold';
    // Centrer les nombres dans les cellules de sous-totaux (colonnes 3 et plus)
    if (data.column.index >= 3) {
      data.cell.styles.halign = 'center';
    }
  }
  
  // Mettre en évidence les lignes de totaux
  if (data.row.raw && 
      data.row.raw[0] === 'TOTAL') {
    data.cell.styles.fillColor = [220, 220, 220];
    data.cell.styles.fontStyle = 'bold';
    // Centrer les nombres dans les cellules de totaux (colonnes 3 et plus)
    if (data.column.index >= 3) {
      data.cell.styles.halign = 'center';
    }
  }
  
  // Centrer toutes les abréviations (AR, SR) et les combinaisons avec AM
  if (data.row.section === 'body' && data.column.index >= 3) {
    const cellValue = data.cell.raw;
    if (cellValue === MEAL_ABBREVIATIONS.WITH_MEAL || 
        cellValue === MEAL_ABBREVIATIONS.WITHOUT_MEAL ||
        (typeof cellValue === 'string' && 
         (cellValue.includes('AM ') || cellValue === 'AM'))) {
      data.cell.styles.halign = 'center';
    }
  }
};
