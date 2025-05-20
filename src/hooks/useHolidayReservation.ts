import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';  // adjust import as needed for your supabase client

export default function useHolidayReservation() {
  // Fetch list of children from Supabase
  const { data: children, error: childrenError, isLoading: isChildrenLoading } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*');
      if (error) {
        throw error;
      }
      return data;
    },
    // Add other options if needed (e.g., enabled, staleTime, gcTime)
  });

  // Fetch list of holiday periods from Supabase
  const { data: holidayPeriods, error: holidayPeriodsError, isLoading: isHolidayPeriodsLoading } = useQuery({
    queryKey: ['holiday_periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('holiday_periods')
        .select('*');
      if (error) {
        throw error;
      }
      return data;
    },
    // Add other options if needed (e.g., enabled, staleTime, gcTime)
  });

  // Return the data and relevant state, preserving the existing business logic
  return {
    children,
    holidayPeriods,
    isLoading: isChildrenLoading || isHolidayPeriodsLoading,
    error: childrenError ?? holidayPeriodsError,
  };
}
