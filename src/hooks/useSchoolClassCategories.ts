
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSchoolClassCategories = () => {
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
    ) || false;
  };

  return { schoolClassCategories, isTeenClass };
};
