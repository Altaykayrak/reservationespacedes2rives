
import { useState } from "react";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

export const useDateSelection = () => {
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);
  const isTeenPage = window.location.pathname === "/teenholiday-reservations" || 
                      window.location.pathname === "/admin/reservations/new-teen-holiday" ||
                      window.location.pathname === "/admin/new-teenholiday-reservation";

  const handleDateToggle = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isSelected = selectedDates.some(d => d.date.toISOString().split('T')[0] === dateStr);

    if (isSelected) {
      setSelectedDates(prev => prev.filter(d => d.date.toISOString().split('T')[0] !== dateStr));
    } else {
      setSelectedDates(prev => [...prev, { date: new Date(date), withoutMeal: isTeenPage, earlyDropoff: false }]);
    }
    
    // Log for debugging
    console.log(`Date ${dateStr} ${isSelected ? 'désélectionnée' : 'sélectionnée'}, nombre actuel: ${isSelected ? selectedDates.length - 1 : selectedDates.length + 1}`);
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => {
      return prev.map(d => {
        if (d.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]) {
          return { ...d, [option]: value };
        }
        return d;
      });
    });
  };

  return {
    selectedDates,
    setSelectedDates,
    handleDateToggle,
    handleOptionChange,
    isTeenPage
  };
};
