
import { CellHookData } from 'jspdf-autotable';

// Couleurs équilibrées pour les classes (ni trop vives ni trop pastels)
const CLASS_COLORS = {
  'PS': [255, 150, 150], // Rouge modéré
  'MS': [150, 255, 150], // Vert modéré
  'GS': [150, 150, 255], // Bleu modéré
  'CP': [255, 255, 100], // Jaune modéré
  'CE1': [255, 100, 255], // Magenta modéré
  'CE2': [100, 255, 255], // Cyan modéré
  'CM1': [255, 180, 100], // Orange modéré
  'CM2': [180, 255, 100], // Vert lime modéré
  '6EME': [255, 140, 180], // Rose modéré
  '5EME': [140, 180, 255], // Bleu modéré
  '4EME': [180, 255, 140], // Vert modéré
  '3EME': [255, 160, 100], // Orange saumon modéré
  'SECONDE': [180, 140, 255], // Violet modéré
  'PREMIERE': [255, 220, 100], // Or modéré
  'TERMINALE': [140, 255, 200] // Vert menthe modéré
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
        cell.styles.fillColor = [200, 200, 200];
      }
      cell.styles.fontStyle = 'bold';
    }
    
    // Supprimer la surbrillance des lignes d'enfants - ne plus colorer les lignes individuelles
    
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
