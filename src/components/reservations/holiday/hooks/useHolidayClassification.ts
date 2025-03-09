
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSchoolClassUtils } from "@/hooks/useSchoolClassUtils";

export const useHolidayClassification = (selectedChild: string) => {
  const { data: childInfo } = useQuery({
    queryKey: ["child", selectedChild],
    queryFn: async () => {
      if (!selectedChild) return null;
      const { data, error } = await supabase
        .from("children")
        .select("school_class")
        .eq("id", selectedChild)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedChild,
  });

  const { isTeenClass } = useSchoolClassUtils();
  
  return { 
    childInfo, 
    isTeenClass: childInfo?.school_class ? isTeenClass(childInfo.school_class) : false 
  };
};
