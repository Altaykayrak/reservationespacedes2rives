
import { UserOptions } from 'jspdf-autotable';

export const createTableStyles = (fontSize: number): UserOptions => ({
  styles: {
    fontSize: fontSize,
    cellPadding: 2,
    lineColor: [0, 0, 0], // Couleur des bordures (noir)
    lineWidth: 0.1 // Épaisseur des bordures
  },
  headStyles: {
    fillColor: [41, 128, 185],
    textColor: 255,
    fontStyle: 'bold',
    halign: 'center',
    lineColor: [0, 0, 0], // Bordures pour les en-têtes
    lineWidth: 0.1
  },
  columnStyles: {
    0: { fontStyle: 'bold' },
    2: { halign: 'center' }
  },
  alternateRowStyles: {
    fillColor: [245, 245, 245]
  },
  tableLineColor: [0, 0, 0], // Couleur des bordures du tableau
  tableLineWidth: 0.1, // Épaisseur des bordures du tableau
});
