
export const normalizeSchoolClass = (schoolClass: string): string => {
  const classMap: { [key: string]: string } = {
    "PETITE SECTION": "PS",
    "MOYENNE SECTION": "MS",
    "GRANDE SECTION": "GS",
    "6EME": "6ème",
    "5EME": "5ème",
    "4EME": "4ème",
    "3EME": "3ème",
    "SECONDE": "Seconde",
    "PREMIERE": "Première",
    "TERMINALE": "Terminale"
  };

  const normalizedClass = schoolClass.trim().toUpperCase();
  return classMap[normalizedClass] || schoolClass.trim();
};

export const getGroupName = (schoolClass: string) => {
  const normalizedClass = normalizeSchoolClass(schoolClass);
  if (["PS", "MS", "GS"].includes(normalizedClass)) 
    return 'maternelle';
  if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) 
    return 'primaire';
  return 'adolescent';
};
