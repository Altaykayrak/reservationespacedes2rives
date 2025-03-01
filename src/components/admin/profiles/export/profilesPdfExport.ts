
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { ProfileData } from "@/types/profile";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const exportProfilesToPDF = (profiles: ProfileData[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title with current date
  const currentDate = format(new Date(), "PPP", { locale: fr });
  doc.setFontSize(18);
  doc.text(`Liste des utilisateurs (${profiles.length})`, 14, 15);
  
  doc.setFontSize(12);
  doc.text(`Exporté le ${currentDate}`, 14, 22);

  // Define table headers
  const headers = [
    "Nom",
    "Prénom",
    "Email",
    "Prélèvement automatique",
    "En attente",
    "Fermé",
    "Date d'inscription"
  ];

  // Prepare table data
  const tableData = profiles.map(profile => [
    profile.last_name || "-",
    profile.first_name || "-",
    profile.email || "-",
    profile.automatic_payment ? "Oui" : "Non",
    profile.is_waiting ? "Oui" : "Non",
    profile.is_closed ? "Oui" : "Non",
    format(new Date(profile.created_at), "dd/MM/yyyy")
  ]);

  // Add totals row
  const totals = calculateTotals(profiles);
  tableData.push([
    "TOTAL",
    "",
    `${profiles.length} utilisateurs`,
    `${totals.automaticPayment} prélèvements auto.`,
    `${totals.waiting} en attente`,
    `${totals.closed} fermés`,
    ""
  ]);

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    },
    // Style the last row (totals) differently
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [220, 220, 220];
      }
    }
  });

  doc.save("utilisateurs.pdf");
};

const calculateTotals = (profiles: ProfileData[]) => {
  return {
    automaticPayment: profiles.filter(profile => profile.automatic_payment).length,
    waiting: profiles.filter(profile => profile.is_waiting).length,
    closed: profiles.filter(profile => profile.is_closed).length
  };
};
