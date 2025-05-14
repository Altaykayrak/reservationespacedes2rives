
/**
 * Utility functions for translating between frontend category names and database category names
 */

// Frontend categories
type FrontendCategory = 'maternelle' | 'primaire' | 'adolescent';

// Database categories
type DatabaseCategory = 'kindergarten' | 'primary' | 'teen';

/**
 * Translate a frontend category to a database category
 */
export const frontendToDbCategory = (frontendCategory: FrontendCategory): DatabaseCategory => {
  switch (frontendCategory) {
    case 'maternelle':
      return 'kindergarten';
    case 'primaire':
      return 'primary';
    case 'adolescent':
      return 'teen';
    default:
      console.error(`Unknown frontend category: ${frontendCategory}`);
      return 'primary'; // Safe default
  }
};

/**
 * Translate a database category to a frontend category
 */
export const dbToFrontendCategory = (dbCategory: DatabaseCategory): FrontendCategory => {
  switch (dbCategory) {
    case 'kindergarten':
      return 'maternelle';
    case 'primary':
      return 'primaire';
    case 'teen':
      return 'adolescent';
    default:
      console.error(`Unknown database category: ${dbCategory}`);
      return 'primaire'; // Safe default
  }
};

/**
 * Determine the database category from a school class
 */
export const schoolClassToDbCategory = (schoolClass: string): DatabaseCategory => {
  // Normalize the input
  const normalizedClass = schoolClass.trim().toUpperCase();
  
  // Match patterns
  if (["PS", "MS", "GS", "PETITE SECTION", "MOYENNE SECTION", "GRANDE SECTION"].includes(normalizedClass)) {
    return "kindergarten";
  } else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) {
    return "primary";
  } else if (["6EME", "6ÈME", "5EME", "5ÈME", "4EME", "4ÈME", "3EME", "3ÈME", 
              "SECONDE", "PREMIERE", "PREMIÈRE", "TERMINALE"].includes(normalizedClass)) {
    return "teen";
  }
  
  // Default for safety
  console.warn(`Category not explicitly mapped for class: ${schoolClass}, defaulting to teen`);
  return "teen";
};

/**
 * Determine the frontend category from a school class
 */
export const schoolClassToFrontendCategory = (schoolClass: string): FrontendCategory => {
  const dbCategory = schoolClassToDbCategory(schoolClass);
  return dbToFrontendCategory(dbCategory);
};
