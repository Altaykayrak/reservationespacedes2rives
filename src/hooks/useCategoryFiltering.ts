import { useMemo } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSchoolClassCategories } from "./useSchoolClassCategories";

/**
 * Hook to filter children based on class category and period
 */
export const useCategoryFiltering = (
  children: Tables<"children">[] | null | undefined,
  selectedPeriodId: string,
  targetCategory?: 'maternelle' | 'primaire' | 'adolescent'
) => {
  const { getClassCategorySync } = useSchoolClassCategories();
  
  // Filter children based on their category for a specific period
  const filteredChildren = useMemo(() => {
    if (!children) return [];
    
    return children.filter(child => {
      // Skip children with missing school class
      if (!child?.school_class) return false;
      
      // Get classification for this child and period
      const childCategory = getClassCategorySync(child.school_class, selectedPeriodId);
      
      // If no target category is specified, return all children
      if (!targetCategory) return true;
      
      // Otherwise filter by target category
      return childCategory === targetCategory;
    });
  }, [children, selectedPeriodId, targetCategory, getClassCategorySync]);
  
  return {
    filteredChildren
  };
};
