
import { normalizeSchoolClass, getGroupName } from "@/utils/schoolClassUtils";

export const useSchoolClassUtils = () => {
  const isTeenClass = (schoolClass: string) => {
    const normalizedClass = normalizeSchoolClass(schoolClass);
    const group = getGroupName(normalizedClass);
    return group === 'adolescent';
  };

  return { isTeenClass };
};
