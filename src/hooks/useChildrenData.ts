
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  const { data: schoolClassCategories } = useQuery({
    queryKey: ["schoolClassCategories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  const isTeenClass = (schoolClass: string) => {
    return schoolClassCategories?.some(
      category => 
        category.category === "adolescent" && 
        schoolClass.toUpperCase() === category.name.toUpperCase()
    );
  };

  const teenChildren = children?.filter(child => isTeenClass(child.school_class)) || [];
  const nonTeenChildren = children?.filter(child => !isTeenClass(child.school_class)) || [];

  return { 
    children,
    isLoading,
    teenChildren,
    nonTeenChildren
  };
};
