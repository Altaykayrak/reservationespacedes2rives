
import React, { createContext, useContext, ReactNode } from 'react';
import { Tables } from "@/integrations/supabase/types";

interface HolidayPeriodContextType {
  holidayPeriod: Tables<"available_holiday_periods"> | null;
  childInfo: { school_class: string } | null;
  isTeenClass: boolean;
}

const HolidayPeriodContext = createContext<HolidayPeriodContextType | undefined>(undefined);

export const HolidayPeriodProvider: React.FC<{
  children: ReactNode;
  holidayPeriod: Tables<"available_holiday_periods"> | null;
  childInfo: { school_class: string } | null;
  isTeenClass: boolean;
}> = ({ children, holidayPeriod, childInfo, isTeenClass }) => {
  return (
    <HolidayPeriodContext.Provider value={{ holidayPeriod, childInfo, isTeenClass }}>
      {children}
    </HolidayPeriodContext.Provider>
  );
};

export const useHolidayPeriodContext = () => {
  const context = useContext(HolidayPeriodContext);
  if (context === undefined) {
    throw new Error('useHolidayPeriodContext must be used within a HolidayPeriodProvider');
  }
  return context;
};
