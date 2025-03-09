
import { useState } from "react";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { format } from "date-fns";

type SortOrder = "date" | "name";

export const useFilteredReservations = (
  wednesdayReservations: WednesdayReservationWithChild[] | null | undefined,
  holidayReservations: HolidayReservationWithChild[] | null | undefined
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("name");

  const sortReservations = <T extends WednesdayReservationWithChild | HolidayReservationWithChild>(
    reservations: T[] | null | undefined
  ) => {
    if (!reservations) return reservations;

    return [...reservations].sort((a, b) => {
      if (sortOrder === "name") {
        const lastNameA = a.children?.last_name.toLowerCase() || '';
        const lastNameB = b.children?.last_name.toLowerCase() || '';
        
        if (lastNameA !== lastNameB) {
          return lastNameA.localeCompare(lastNameB);
        }
        
        const firstNameA = a.children?.first_name.toLowerCase() || '';
        const firstNameB = b.children?.first_name.toLowerCase() || '';
        return firstNameA.localeCompare(firstNameB);
      } else {
        const dateA = new Date('wednesday_id' in a ? a.available_wednesdays.date : a.reservation_date);
        const dateB = new Date('wednesday_id' in b ? b.available_wednesdays.date : b.reservation_date);
        return dateA.getTime() - dateB.getTime();
      }
    });
  };

  const filterReservations = <T extends WednesdayReservationWithChild | HolidayReservationWithChild>(
    reservations: T[] | null | undefined,
    isWednesday: boolean
  ) => {
    const filteredReservations = reservations?.filter((reservation) => {
      const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
      const searchMatch = searchQuery 
        ? fullName.includes(searchQuery.toLowerCase())
        : true;

      const reservationDate = isWednesday 
        ? (reservation as WednesdayReservationWithChild).available_wednesdays.date
        : (reservation as HolidayReservationWithChild).reservation_date;
      
      const reservationDateStr = format(new Date(reservationDate), "yyyy-MM-dd");

      let dateMatch = true;
      if (startDate && endDate) {
        dateMatch = reservationDateStr >= startDate && reservationDateStr <= endDate;
      } else if (startDate) {
        dateMatch = reservationDateStr >= startDate;
      } else if (endDate) {
        dateMatch = reservationDateStr <= endDate;
      }

      const classMatch = selectedClass === "all"
        ? true
        : reservation.children?.school_class === selectedClass;

      const getGroup = (schoolClass: string) => {
        const normalizedClass = schoolClass.toUpperCase();
        if (["PS", "MS", "GS"].includes(normalizedClass)) return "maternelle";
        if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(normalizedClass)) return "primaire";
        if (["6EME", "5EME", "4EME", "3EME", "SECONDE", "PREMIERE", "TERMINALE", "6ÈME", "5ÈME", "4ÈME", "3ÈME", "PREMIÈRE"].includes(normalizedClass)) return "ado";
        return "";
      };

      const groupMatch = selectedGroup === "all"
        ? true
        : getGroup(reservation.children?.school_class || "") === selectedGroup;

      return searchMatch && dateMatch && classMatch && groupMatch;
    });

    return sortReservations(filteredReservations);
  };

  const filteredWednesdayReservations = filterReservations(wednesdayReservations, true);
  const filteredHolidayReservations = filterReservations(holidayReservations, false);

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
    sortOrder,
    setSortOrder,
    filteredWednesdayReservations,
    filteredHolidayReservations
  };
};
