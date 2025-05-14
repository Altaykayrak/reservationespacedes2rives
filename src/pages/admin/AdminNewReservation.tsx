
import { useState } from "react";
import { AdminReservationForm } from "@/components/admin/reservations/AdminReservationForm";

interface DateOption {
  date: Date;
  withoutMeal: boolean;
  earlyDropoff: boolean;
}

const AdminNewReservation = () => {
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedDates, setSelectedDates] = useState<DateOption[]>([]);

  const handleDateToggle = (date: Date) => {
    setSelectedDates(prev => {
      const existingDate = prev.find(d => d.date.getTime() === date.getTime());
      if (existingDate) {
        return prev.filter(d => d.date.getTime() !== date.getTime());
      } else {
        return [...prev, { date, withoutMeal: false, earlyDropoff: false }];
      }
    });
  };

  const handleOptionChange = (date: Date, option: 'withoutMeal' | 'earlyDropoff', value: boolean) => {
    setSelectedDates(prev => prev.map(d => {
      if (d.date.getTime() === date.getTime()) {
        return { ...d, [option]: value };
      }
      return d;
    }));
  };

  const resetForm = () => {
    setSelectedChild("");
    setSelectedDates([]);
  };

  console.log("Rendering AdminNewReservation"); // Ajout d'un log pour debug

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Nouvelle réservation</h1>
      <AdminReservationForm
        selectedChild={selectedChild}
        setSelectedChild={setSelectedChild}
        selectedDates={selectedDates}
        handleDateToggle={handleDateToggle}
        handleOptionChange={handleOptionChange}
        resetForm={resetForm}
      />
    </div>
  );
};

export default AdminNewReservation;
