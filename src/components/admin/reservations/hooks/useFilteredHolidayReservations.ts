
import { useState, useMemo } from "react";
import { HolidayReservationWithChild } from "@/types/reservations";
import { usePagination } from "./usePagination";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";

export const useFilteredHolidayReservations = (
  holidayReservations: HolidayReservationWithChild[] | null
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const { getClassCategorySync } = useSchoolClassCategories();

  const holidayPeriods = useMemo(() => {
    if (!holidayReservations) return [];
    
    const periods = new Set<string>();
    const periodMap = new Map<string, string>();
    
    holidayReservations.forEach(reservation => {
      if (reservation.period_id && reservation.available_holiday_periods?.name) {
        periods.add(reservation.period_id);
        periodMap.set(reservation.period_id, reservation.available_holiday_periods.name);
      }
    });
    
    return Array.from(periods).map(id => ({
      id,
      name: periodMap.get(id) || 'Période inconnue'
    }));
  }, [holidayReservations]);

  const filteredHolidayReservations = useMemo(() => {
    if (!holidayReservations) return null;

    return holidayReservations.filter((reservation) => {
      const childFullName = `${reservation.children.first_name} ${reservation.children.last_name}`.toLowerCase();
      const matchesSearch = searchQuery === "" || childFullName.includes(searchQuery.toLowerCase());

      const reservationDate = new Date(reservation.reservation_date);
      const matchesStartDate = !startDate || reservationDate >= new Date(startDate);
      const matchesEndDate = !endDate || reservationDate <= new Date(endDate);

      const childClass = reservation.children.school_class;
      const matchesClass = selectedClass === "all" || childClass === selectedClass;

      // Utiliser la logique de classification correcte pour les groupes selon la période
      let matchesGroup = selectedGroup === "all";
      if (selectedGroup !== "all" && reservation.children?.school_class) {
        const group = getClassCategorySync(reservation.children.school_class, reservation.period_id);
        matchesGroup = group === selectedGroup;
      }

      const matchesPeriod = selectedPeriod === "all" || reservation.period_id === selectedPeriod;

      return matchesSearch && matchesStartDate && matchesEndDate && matchesClass && matchesGroup && matchesPeriod;
    });
  }, [holidayReservations, searchQuery, startDate, endDate, selectedClass, selectedGroup, selectedPeriod, getClassCategorySync]);

  const holidayPagination = usePagination(filteredHolidayReservations || []);

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
    selectedPeriod,
    setSelectedPeriod,
    filteredHolidayReservations,
    holidayPeriods,
    holidayPagination
  };
};
