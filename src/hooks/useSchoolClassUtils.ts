
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { schoolClassToDbCategory } from "@/utils/categoryTranslationUtils";

/**
 * Hook for working with school classes and their categories
 */
export const useSchoolClassUtils = () => {
  // Cache for classification results
  const [cache, setCache] = useState<Record<string, string>>({});

  // Normalize a school class for consistent comparison
  const normalizeClass = useCallback((schoolClass: string): string => {
    return schoolClass.trim().toUpperCase();
  }, []);

  // Get the category for a class with period-specific mapping
  const getClassCategory = useCallback(async (
    schoolClass: string, 
    periodId?: string
  ): Promise<string> => {
    if (!schoolClass) return "";

    // Create cache key based on class and period
    const cacheKey = `${schoolClass}-${periodId || 'default'}`;
    
    // Return from cache if available
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    try {
      // Check for period-specific mapping first
      if (periodId) {
        const { data, error } = await supabase
          .from("holiday_period_class_mappings")
          .select("category")
          .eq("holiday_period_id", periodId)
          .eq("school_class", normalizeClass(schoolClass))
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching class mapping:", error);
        } else if (data) {
          // Cache and return the mapped category
          setCache(prev => ({ ...prev, [cacheKey]: data.category }));
          return data.category;
        }
      }
      
      // If no specific mapping was found, use standard classification
      const dbCategory = schoolClassToDbCategory(schoolClass);
      
      // Convert database category to frontend category
      let frontendCategory: string;
      if (dbCategory === 'kindergarten') frontendCategory = 'maternelle';
      else if (dbCategory === 'primary') frontendCategory = 'primaire';
      else frontendCategory = 'adolescent';
      
      // Cache and return the result
      setCache(prev => ({ ...prev, [cacheKey]: frontendCategory }));
      return frontendCategory;
    } catch (error) {
      console.error("Error in getClassCategory:", error);
      return "primaire"; // Safe default
    }
  }, [cache, normalizeClass]);

  // Synchronous version for use in render functions
  const getClassCategorySync = useCallback((
    schoolClass: string,
    periodId?: string
  ): string => {
    if (!schoolClass) return "";

    // Check cache first
    const cacheKey = `${schoolClass}-${periodId || 'default'}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Use our utility function for standard classification
    const dbCategory = schoolClassToDbCategory(schoolClass);
    
    // Convert to frontend category
    if (dbCategory === 'kindergarten') return 'maternelle';
    if (dbCategory === 'primary') return 'primaire';
    return 'adolescent';
  }, [cache]);

  // Helper function to determine if a class is for teens
  const isTeenClass = useCallback(async (
    schoolClass: string,
    periodId?: string
  ): Promise<boolean> => {
    const category = await getClassCategory(schoolClass, periodId);
    return category === "adolescent";
  }, [getClassCategory]);

  // Synchronous version for teens check
  const isTeenClassSync = useCallback((
    schoolClass: string,
    periodId?: string
  ): boolean => {
    const category = getClassCategorySync(schoolClass, periodId);
    return category === "adolescent";
  }, [getClassCategorySync]);

  // Invalidate cache function for when mappings change
  const invalidateCache = useCallback(() => {
    setCache({});
  }, []);

  return {
    getClassCategory,
    getClassCategorySync,
    isTeenClass,
    isTeenClassSync,
    invalidateCache,
    normalizeClass
  };
};
