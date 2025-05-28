
// Définir les abréviations pour les repas
export const MEAL_ABBREVIATIONS = {
  WITH_MEAL: 'AVR', // Avec Repas
  WITHOUT_MEAL: 'SSR' // Sans Repas
} as const;

// Configuration des formats PDF
export const PDF_CONFIG = {
  A3_THRESHOLD: 10, // Nombre de dates au-delà duquel on utilise A3
  FONT_SIZE: {
    A3: 7,  // Réduit de 8 à 7
    A4: 8   // Réduit de 9 à 8
  }
} as const;
