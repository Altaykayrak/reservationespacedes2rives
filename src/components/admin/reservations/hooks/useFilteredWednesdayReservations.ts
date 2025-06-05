
import { useState, useMemo } from "react";
import { WednesdayReservationWithChild } from "@/types/reservations";
import { usePagination } from "./usePagination";
import { format } from "date-fns";

export const useFilteredWednesdayReservations = (
  wednesdayReservations: WednesdayReservationWithChild[] | null
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const filteredWednesdayReservations = useMemo(() => {
    if (!wednesdayReservations) return null;

    return wednesdayReservations.filter((reservation) => {
      const childFullName = `${reservation.children.first_name} ${reservation.children.last_name}`.toLowerCase();
      const matchesSearch = searchQuery === "" || childFullName.includes(searchQuery.toLowerCase());

      const reservationDate = new Date(reservation.available_wednesdays?.date || '');
      const matchesStartDate = !startDate || reservationDate >= startDate;
      const matchesEndDate = !endDate || reservationDate <= endDate;

      const childClass = reservation.children.school_class;
      const matchesClass = selectedClass === "all" || childClass === selectedClass;

      const matchesGroup = selectedGroup === "all" || 
        (selectedGroup === "maternelle" && ["PS", "MS", "GS"].includes(childClass)) ||
        (selectedGroup === "primaire" && ["CP", "CE1", "CE2", "CM1", "CM2"].includes(childClass));

      return matchesSearch && matchesStartDate && matchesEndDate && matchesClass && matchesGroup;
    });
  }, [wednesdayReservations, searchQuery, startDate, endDate, selectedClass, selectedGroup]);

  const wednesdayPagination = usePagination(filteredWednesdayReservations || []);

  return {
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedClass,
    setSelectedClass,
    selectedGroup,
    setSelectedGroup,
    filteredWednesdayReservations,
    wednesdayPagination
  };
};
