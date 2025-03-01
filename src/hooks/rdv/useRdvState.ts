
import { useState } from "react";
import { Rdv } from "@/types/rdv";

export const useRdvState = () => {
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [userRdv, setUserRdv] = useState<Rdv | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Rdv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  return {
    rdvList,
    setRdvList,
    userRdv,
    setUserRdv,
    availableSlots,
    setAvailableSlots,
    isLoading,
    setIsLoading,
    selectedRdv,
    setSelectedRdv,
    selectedMotifs,
    setSelectedMotifs,
    showConfirmDialog,
    setShowConfirmDialog,
    reservationComplete,
    setReservationComplete,
    selectedDate,
    setSelectedDate
  };
};
