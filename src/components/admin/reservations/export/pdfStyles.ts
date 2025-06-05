
import { UserOptions } from 'jspdf-autotable';

export const createTableStyles = (fontSize: number): UserOptions => ({
  styles: {
    fontSize: fontSize,
    cellPadding: 1,
    lineColor: [0, 0, 0],
    lineWidth: 0.1
  },
  headStyles: {
    fillColor: [59, 130, 246], // Bleu comme holiday spots
    textColor: 255,
    fontStyle: 'bold',
    halign: 'center',
    lineColor: [0, 0, 0],
    lineWidth: 0.1
  },
  columnStyles: {
    0: { fontStyle: 'bold' },
    2: { halign: 'center' }
  },
  alternateRowStyles: {
    fillColor: [248, 250, 252] // Gris très clair comme holiday spots
  },
  tableLineColor: [0, 0, 0],
  tableLineWidth: 0.1,
});
