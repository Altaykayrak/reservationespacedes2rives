
// Fonction pour définir l'ordre chronologique des classes
export const getClassOrder = (className: string): number => {
  const classOrderMap: { [key: string]: number } = {
    // Maternelles
    "PS": 1,
    "PETITE SECTION": 1,
    "MS": 2,
    "MOYENNE SECTION": 2,
    "GS": 3,
    "GRANDE SECTION": 3,
    
    // Primaires
    "CP": 4,
    "CE1": 5,
    "CE2": 6,
    "CM1": 7,
    "CM2": 8,
    
    // Collège
    "6ÈME": 9,
    "6EME": 9,
    "5ÈME": 10,
    "5EME": 10,
    "4ÈME": 11,
    "4EME": 11,
    "3ÈME": 12,
    "3EME": 12,
    
    // Lycée
    "SECONDE": 13,
    "PREMIÈRE": 14,
    "PREMIERE": 14,
    "TERMINALE": 15
  };

  const normalizedClass = className.trim().toUpperCase();
  return classOrderMap[normalizedClass] || 999;
};

export const sortClassesByOrder = (classes: string[]): string[] => {
  return classes.sort((a, b) => {
    const orderA = getClassOrder(a);
    const orderB = getClassOrder(b);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.localeCompare(b);
  });
};
