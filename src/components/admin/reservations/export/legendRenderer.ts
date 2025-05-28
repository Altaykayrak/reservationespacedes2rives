
import { jsPDF } from "jspdf";

export const addLegend = (doc: jsPDF) => {
  // Ajouter la légende en bas de page
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.text("Légende :", 14, finalY + 10);
  doc.text("AR = Avec Repas", 14, finalY + 15);
  doc.text("SR = Sans Repas", 14, finalY + 20);
  doc.text("AM = Arrivée Matinale", 14, finalY + 25);
};
