
import { CellHookData } from 'jspdf-autotable';

// Couleurs équilibrées pour les classes (mêmes que holiday spots)
const CLASS_COLORS = {
  'PS': [255, 182, 193], // Rose clair
  'MS': [144, 238, 144], // Vert clair
  'GS': [173, 216, 230], // Bleu clair
  'CP': [255, 255, 224], // Jaune clair
  'CE1': [221, 160, 221], // Violet clair
  'CE2': [175, 238, 238], // Cyan clair
  'CM1': [255, 218, 185], // Orange clair
  'CM2': [240, 230, 140], // Kaki clair
  '6EME': [255, 192, 203], // Rose
  '5EME': [176, 196, 222], // Bleu acier clair
  '4EME': [152, 251, 152], // Vert menthe
  '3EME': [255, 160, 122], // Saumon clair
  'SECONDE': [216, 191, 216], // Thistle
  'PREMIERE': [255, 228, 181], // Moccasin
  'TERMINALE': [175, 238, 198] // Vert menthe clair
} as const;

export const customizeCell = (data: CellHookData) => {
  const { cell, section, row } = data;
  
  if (section === 'body') {
    const cellText = cell.text[0];
    
    // Identifier les en-têtes de classe uniquement
    if (cellText && cellText.startsWith('Classe:')) {
      const className = cellText.replace('Classe: ', '').trim();
      const classColor = CLASS_COLORS[className as keyof typeof CLASS_COLORS];
      
      if (classColor) {
        cell.styles.fillColor = [classColor[0], classColor[1], classColor[2]] as [number, number, number];
      } else {
        // Couleur par défaut pour les classes non définies
        cell.styles.fillColor = [230, 230, 230];
      }
      cell.styles.fontStyle = 'bold';
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
      cell.styles.textColor = [220, 38, 127]; // Rose magenta comme holiday spots
      cell.styles.fontStyle = 'bold';
      cell.styles.halign = 'center';
    }
    
    // Pour les valeurs numériques du total général TOTAL
    if (row.raw && Array.isArray(row.raw) && 
        row.raw[0] === 'TOTAL' &&
        data.column.index > 2) {
      cell.styles.textColor = [220, 38, 127]; // Rose magenta
      cell.styles.fontStyle = 'bold';
      cell.styles.halign = 'center';
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
