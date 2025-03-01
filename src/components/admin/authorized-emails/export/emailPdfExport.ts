
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface EmailExportFilter {
  searchTerm: string;
}

export const exportEmailsToPdf = (
  emails: { id: string; email: string; created_at: string }[],
  filters: EmailExportFilter
) => {
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Set document title
  doc.setFontSize(18);
  doc.text("Liste des emails autorisés", 14, 22);
  
  // Add export date
  doc.setFontSize(11);
  doc.text(`Date d'export: ${format(new Date(), "dd/MM/yyyy à HH:mm")}`, 14, 30);
  
  // Add filter information if any filter is applied
  let yPosition = 38;
  if (filters.searchTerm) {
    doc.text(`Filtre de recherche: "${filters.searchTerm}"`, 14, yPosition);
    yPosition += 8;
  }
  
  // Define columns for the table
  const tableColumn = ["Email", "Date d'ajout"];
  
  // Map the data to the table
  const tableRows = emails.map((email) => [
    email.email,
    format(new Date(email.created_at), "dd/MM/yyyy")
  ]);
  
  // Add a table with all emails
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: yPosition,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 30 },
  });
  
  // Add total count at the bottom
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Nombre total d'emails: ${emails.length}`, 14, finalY);
  
  // Save the PDF
  doc.save(`emails_autorises_${format(new Date(), "dd-MM-yyyy")}.pdf`);
};
