
import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * A unified hook that handles child classification with both synchronous and asynchronous support,
 * including caching and proper handling of period-specific mappings.
 */
export const useSchoolClassCategories = () => {
  // Cache for classification results
  const [cache, setCache] = useState<Record<string, string>>({});

  // Retrieve standard classifications from the database
  const { data: standardCategories } = useQuery({
    queryKey: ["school_class_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) {
        console.error("Error fetching class categories:", error);
        return [];
      }
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Retrieve all period-specific mappings
  const { data: periodMappings } = useQuery({
    queryKey: ["all_holiday_period_mappings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("*");
      
      if (error) {
        console.error("Error fetching period mappings:", error);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

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

    const normalizedClass = normalizeClass(schoolClass);
    
    try {
      // Check for period-specific mapping first
      if (periodId && periodMappings) {
        const mapping = periodMappings.find(
          m => normalizeClass(m.school_class) === normalizedClass && 
               m.holiday_period_id === periodId
        );
        
        if (mapping) {
          // Cache and return the mapped category
          setCache(prev => ({ ...prev, [cacheKey]: mapping.category }));
          return mapping.category;
        }
      }
      
      // Fall back to standard category
      if (standardCategories) {
        const category = standardCategories.find(
          c => normalizeClass(c.name) === normalizedClass
        );
        
        if (category) {
          // Cache and return the standard category
          setCache(prev => ({ ...prev, [cacheKey]: category.category }));
          return category.category;
        }
      }

      // Default category determination
      if (["PS", "MS", "GS"].includes(normalizedClass)) {
        setCache(prev => ({ ...prev, [cacheKey]: "maternelle" }));
        return "maternelle";
      } 
      else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) {
        setCache(prev => ({ ...prev, [cacheKey]: "primaire" }));
        return "primaire";
      }
      else if (["6EME", "6ÈME", "5EME", "5ÈME", "4EME", "4ÈME", "3EME", "3ÈME",
                "SECONDE", "PREMIÈRE", "PREMIERE", "TERMINALE"].includes(normalizedClass)) {
        setCache(prev => ({ ...prev, [cacheKey]: "adolescent" }));
        return "adolescent";
      }
      
      // Default fallback
      setCache(prev => ({ ...prev, [cacheKey]: "adolescent" }));
      return "adolescent";
    } catch (error) {
      console.error("Error in getClassCategory:", error);
      return "primaire"; // Safe default
    }
  }, [cache, normalizeClass, standardCategories, periodMappings]);

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

    const normalizedClass = normalizeClass(schoolClass);
    
    // Check for period-specific mapping (only if we already loaded the mappings)
    if (periodId && periodMappings) {
      const mapping = periodMappings.find(
        m => normalizeClass(m.school_class) === normalizedClass && 
             m.holiday_period_id === periodId
      );
      
      if (mapping) {
        return mapping.category;
      }
    }
    
    // Standard categorization logic
    if (["PS", "MS", "GS"].includes(normalizedClass)) {
      return "maternelle";
    } 
    else if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) {
      return "primaire";
    }
    else if (["6EME", "6ÈME", "5EME", "5ÈME", "4EME", "4ÈME", "3EME", "3ÈME",
              "SECONDE", "PREMIÈRE", "PREMIERE", "TERMINALE"].includes(normalizedClass)) {
      return "adolescent";
    }
    
    return "adolescent"; // Safe default
  }, [cache, normalizeClass, periodMappings]);

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
