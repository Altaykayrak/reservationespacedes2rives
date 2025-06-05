
import { CellHookData } from 'jspdf-autotable';

// Couleurs pastels pour les classes
const CLASS_COLORS = {
  'PS': [255, 230, 230], // Rose pastel
  'MS': [230, 255, 230], // Vert pastel
  'GS': [230, 230, 255], // Bleu pastel
  'CP': [255, 255, 230], // Jaune pastel
  'CE1': [255, 230, 255], // Violet pastel
  'CE2': [230, 255, 255], // Cyan pastel
  'CM1': [255, 240, 230], // Orange pastel
  'CM2': [240, 255, 230], // Vert clair pastel
  '6EME': [255, 235, 245], // Rose clair pastel
  '5EME': [235, 245, 255], // Bleu clair pastel
  '4EME': [245, 255, 235], // Vert très clair pastel
  '3EME': [255, 245, 235], // Pêche pastel
  'SECONDE': [245, 235, 255], // Lavande pastel
  'PREMIERE': [255, 250, 235], // Crème pastel
  'TERMINALE': [235, 255, 250] // Menthe pastel
} as const;

export const customizeCell = (data: CellHookData) => {
  const { cell, section, row } = data;
  
  if (section === 'body') {
    const cellText = cell.text[0];
    
    // Identifier les en-têtes de classe
    if (cellText && cellText.startsWith('Classe:')) {
      const className = cellText.replace('Classe: ', '').trim();
      const classColor = CLASS_COLORS[className as keyof typeof CLASS_COLORS];
      
      if (classColor) {
        cell.styles.fillColor = [classColor[0], classColor[1], classColor[2]];
      } else {
        // Couleur par défaut pour les classes non définies
        cell.styles.fillColor = [240, 240, 240];
      }
      cell.styles.fontStyle = 'bold';
    }
    
    // Identifier les lignes d'enfants (appartenant à une classe)
    const rowData = row.raw;
    if (Array.isArray(rowData) && rowData.length >= 3 && 
        typeof rowData[2] === 'string' && 
        !cellText?.startsWith('Sous-total') && 
        !cellText?.startsWith('Accueil') && 
        !cellText?.startsWith('Sans Repas') &&
        !cellText?.startsWith('TOTAL') &&
        cellText !== '') {
      
      const className = rowData[2]; // La classe est dans la 3ème colonne
      const classColor = CLASS_COLORS[className as keyof typeof CLASS_COLORS];
      
      if (classColor && data.column.index < 3) { // Seulement pour les 3 premières colonnes (nom, prénom, classe)
        // Appliquer une version très claire de la couleur de classe
        const lightColor: [number, number, number] = [
          Math.min(255, classColor[0] + 20),
          Math.min(255, classColor[1] + 20),
          Math.min(255, classColor[2] + 20)
        ];
        cell.styles.fillColor = lightColor;
      }
    }
    
    // Centrer les sigles AR, SR, AM et le tiret
    if (typeof cellText === 'string' && (
        cellText === 'AR' || 
        cellText === 'SR' || 
        cellText === 'AM' ||
        cellText.startsWith('AM ') ||
        cellText === '-')) {
      cell.styles.halign = 'center';
    }
    
    // Identifier uniquement le total général TOTAL en rouge et gras
    if (cellText === 'TOTAL') {
      cell.styles.textColor = [255, 0, 0]; // Rouge
      cell.styles.fontStyle = 'bold';
      cell.styles.halign = 'center'; // Centrer
    }
    
    // Pour les valeurs numériques du total général TOTAL
    if (row.raw && Array.isArray(row.raw) && 
        row.raw[0] === 'TOTAL' &&
        data.column.index > 2) {
      cell.styles.textColor = [255, 0, 0]; // Rouge
      cell.styles.fontStyle = 'bold';
      cell.styles.halign = 'center'; // Centrer
    }
    
    // Centrer tous les autres totaux (sous-totaux, accueil, sans repas)
    if (typeof cellText === 'string' && (
        cellText.startsWith('Sous-total') || 
        cellText.startsWith('Accueil') || 
        cellText.startsWith('Sans Repas'))) {
      cell.styles.halign = 'center';
      cell.styles.fontStyle = 'bold';
    }
    
    // Centrer les valeurs numériques des autres totaux
    if (row.raw && Array.isArray(row.raw) && 
        (typeof row.raw[0] === 'string' && (
          row.raw[0].startsWith('Sous-total') || 
          row.raw[0].startsWith('Accueil') || 
          row.raw[0].startsWith('Sans Repas')
        )) &&
        data.column.index > 2) {
      cell.styles.halign = 'center';
      cell.styles.fontStyle = 'bold';
    }
  }
};
