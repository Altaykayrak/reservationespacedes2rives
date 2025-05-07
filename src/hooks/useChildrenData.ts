
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "./useSchoolClassUtils";

export const useChildrenData = () => {
  const { data: children, isLoading } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { isTeenClass } = useSchoolClassUtils();

  const teenChildren = children?.filter(child => isTeenClass(child.school_class)) || [];
  const nonTeenChildren = children?.filter(child => !isTeenClass(child.school_class)) || [];
  
  // Ajout d'un filtre pour exclure les PS et les adolescents
  const wednesdayEligibleChildren = children?.filter(child => {
    const isPS = child.school_class.toUpperCase() === "PS";
    const isTeen = isTeenClass(child.school_class);
    return !isPS && !isTeen;
  }) || [];

  return { 
    children,
    isLoading,
    teenChildren,
    nonTeenChildren,
    wednesdayEligibleChildren
  };
};
