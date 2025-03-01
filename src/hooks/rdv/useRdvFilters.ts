
import { useEffect } from "react";
import { format } from "date-fns";
import { Rdv } from "@/types/rdv";

export const useRdvFilters = (
  selectedDate: Date | undefined,
  rdvList: Rdv[],
  setAvailableSlots: (slots: Rdv[]) => void
) => {
  // Update available slots when selected date changes
  useEffect(() => {
    filterSlotsByDate(selectedDate);
  }, [selectedDate, rdvList]);

  const filterSlotsByDate = (date: Date | undefined) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    const formattedSelectedDate = format(date, 'yyyy-MM-dd');
    console.log("Filtering slots for date:", formattedSelectedDate);
    console.log("Total rdvList:", rdvList.length);
    
    const filteredSlots = rdvList.filter(
      slot => slot.date === formattedSelectedDate
    );
    
    console.log("Filtered slots:", filteredSlots);
    setAvailableSlots(filteredSlots);
  };
};
