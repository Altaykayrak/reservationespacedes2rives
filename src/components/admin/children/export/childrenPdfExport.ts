
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Child } from "@/types/profile";
import { getGroupName } from "@/utils/schoolClassUtils";

export const exportChildrenToPdf = (children: Child[], filters: {
  searchQuery: string;
  selectedClass: string;
  selectedGroup: string;
}) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Titre du document
  const title = "Liste des enfants";
  doc.text(title, 14, 15);
  
  // Sous-titre avec filtres appliqués
  let subtitle = "Filtres appliqués: ";
  if (filters.searchQuery) subtitle += `Recherche: "${filters.searchQuery}" `;
  if (filters.selectedClass !== "all") subtitle += `Classe: ${filters.selectedClass} `;
  if (filters.selectedGroup !== "all") subtitle += `Groupe: ${filters.selectedGroup} `;
  
  if (subtitle === "Filtres appliqués: ") subtitle += "Aucun";
  
  doc.setFontSize(11);
  doc.text(subtitle, 14, 22);
  doc.setFontSize(12);

  // Regrouper les enfants par classe
  const childrenByClass = new Map<string, Child[]>();
  
  children.forEach(child => {
    if (!childrenByClass.has(child.school_class)) {
      childrenByClass.set(child.school_class, []);
    }
    childrenByClass.get(child.school_class)?.push(child);
  });

  // Préparer les données pour le tableau
  const headers = ["Nom", "Prénom", "Classe", "Groupe"];
  
  let allTableData: any[] = [];
  
  // Trier les classes par ordre alphabétique
  const sortedClasses = Array.from(childrenByClass.keys()).sort();
  
  sortedClasses.forEach(className => {
    const classData = childrenByClass.get(className)!;
    
    // Ajouter un en-tête pour la classe
    allTableData.push([
      { content: `Classe: ${className}`, colSpan: headers.length, styles: { fillColor: [200, 200, 200], fontStyle: 'bold' } }
    ]);
    
    // Trier les enfants par nom de famille puis prénom
    const sortedChildren = classData.sort((a, b) => {
      const lastNameCompare = a.last_name.localeCompare(b.last_name);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.first_name.localeCompare(b.first_name);
    });
    
    // Ajouter les enfants au tableau
    sortedChildren.forEach(child => {
      const groupName = getGroupName(child.school_class);
      allTableData.push([
        child.last_name,
        child.first_name,
        child.school_class,
        groupName
      ]);
    });
    
    // Ajouter un sous-total par classe
    allTableData.push([
      `Total ${className}:`,
      "",
      `${classData.length} enfants`,
      ""
    ]);
    
    // Ajouter une ligne vide
    allTableData.push(["", "", "", ""]);
  });
  
  // Ajouter un total général
  allTableData.push([
    { content: "", colSpan: headers.length, styles: { fillColor: [220, 220, 220] } }
  ]);
  allTableData.push([
    "TOTAL:",
    "",
    `${children.length} enfants`,
    ""
  ]);

  // Générer le tableau PDF
  autoTable(doc, {
    head: [headers],
    body: allTableData,
    startY: 30,
    styles: {
      fontSize: 10,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });

  // Enregistrer le PDF
  doc.save("liste-enfants.pdf");
};
