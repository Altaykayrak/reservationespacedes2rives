
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useSchoolClassUtils } from "./useSchoolClassUtils";

export const useNonTeenChildrenFiltering = (allChildren: Tables<"children">[] | null | undefined) => {
  const [filteredChildren, setFilteredChildren] = useState<Tables<"children">[] | null>(null);
  const { isTeenClassSync } = useSchoolClassUtils();

  // Récupérer les catégories des classes scolaires pour les non-adolescents
  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategoriesNonTeen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .neq("category", "adolescent");
      
      if (error) {
        console.error("Error fetching non-teen class categories:", error);
        throw error;
      }
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,   // Garbage collection after 10 minutes
  });

  // Mémoriser les enfants filtrés
  const children = useMemo(() => {
    if (!allChildren) return null;
    
    console.log("[useNonTeenChildrenFiltering] Filtering children, count:", allChildren.length);
    
    return allChildren.filter(child => {
      // Vérifier si c'est un enfant non-adolescent selon les catégories
      const isNonTeenByCategory = schoolClassCategories?.some(category => 
        category.name.toUpperCase() === child.school_class.toUpperCase()
      );
      
      // Alternative: utiliser la fonction isTeenClassSync pour exclure les adolescents
      const isNotTeen = !isTeenClassSync(child.school_class);
      
      return isNonTeenByCategory || isNotTeen;
    });
  }, [allChildren, schoolClassCategories, isTeenClassSync]);

  // Mettre à jour l'état local
  useEffect(() => {
    if (children !== filteredChildren) {
      setFilteredChildren(children);
      console.log("[useNonTeenChildrenFiltering] Updated filtered children, count:", children?.length);
    }
  }, [children, filteredChildren]);

  return { filteredChildren, schoolClassCategories };
};
