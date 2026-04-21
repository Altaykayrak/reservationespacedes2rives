
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ExportData } from "./types";
import { formatDate } from "./utils";
import { PDF_CONFIG } from "./constants";
import { createTableStyles } from "./pdfStyles";
import { prepareTableData } from "./tableDataProcessor";
import { customizeCell } from "./cellCustomizer";
import { addLegend } from "./legendRenderer";

export const exportToPdf = (
  exportData: ExportData,
  startDate: string,
  endDate: string,
  selectedGroup?: string
) => {
  const { dates } = exportData;
  
  // Détecter automatiquement le format selon le nombre de dates
  const useA3Format = dates.length > PDF_CONFIG.A3_THRESHOLD;
  const format = useA3Format ? 'a3' : 'a4';
  
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: format
  });

  // Titre avec période et format
  const formatText = useA3Format ? " (Format A3)" : "";
  const title = `Réservations du ${startDate || "début"} au ${endDate || "fin"}${formatText}`;
  doc.setFontSize(16);
  doc.text(title, 14, 15);

  // En-têtes avec jours formatés (format court : Lu 07/07)
  const headers = [
    "Nom",
    "Prénom", 
    "Classe",
    ...dates.map(date => formatDate(date, true))
  ];

  // Préparer les données du tableau
  const allTableData = prepareTableData(exportData, selectedGroup);

  // Ajuster la taille de police selon le format
  const fontSize = useA3Format ? PDF_CONFIG.FONT_SIZE.A3 : PDF_CONFIG.FONT_SIZE.A4;

  // Créer les styles du tableau
  const tableStyles = createTableStyles(fontSize);

  // Générer le tableau
  autoTable(doc, {
    head: [headers],
    body: allTableData,
    startY: 25,
    ...tableStyles,
    didParseCell: customizeCell
  });

  // Ajouter la légende
  addLegend(doc);

  doc.save("reservations.pdf");
};
