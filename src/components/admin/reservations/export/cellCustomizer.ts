import { CellHookData } from 'jspdf-autotable';

// Couleurs vives pour les classes
const CLASS_COLORS = {
  'PS': [255, 102, 102], // Rouge vif
  'MS': [102, 255, 102], // Vert vif
  'GS': [102, 102, 255], // Bleu vif
  'CP': [255, 255, 0], // Jaune vif
  'CE1': [255, 0, 255], // Magenta vif
  'CE2': [0, 255, 255], // Cyan vif
  'CM1': [255, 140, 0], // Orange vif
  'CM2': [0, 255, 0], // Vert lime vif
  '6EME': [255, 20, 147], // Rose vif
  '5EME': [30, 144, 255], // Bleu dodger vif
  '4EME': [50, 205, 50], // Vert lime vif
  '3EME': [255, 69, 0], // Rouge orange vif
  'SECONDE': [138, 43, 226], // Violet vif
  'PREMIERE': [255, 215, 0], // Or vif
  'TERMINALE': [0, 250, 154] // Vert menthe vif
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
        cell.styles.fillColor = [classColor[0], classColor[1], classColor[2]] as [number, number, number];
      } else {
        // Couleur par défaut pour les classes non définies
        cell.styles.fillColor = [200, 200, 200];
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
        // Appliquer une version légèrement atténuée de la couleur de classe
        const lightColor: [number, number, number] = [
          Math.min(255, classColor[0] + 50),
          Math.min(255, classColor[1] + 50),
          Math.min(255, classColor[2] + 50)
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
