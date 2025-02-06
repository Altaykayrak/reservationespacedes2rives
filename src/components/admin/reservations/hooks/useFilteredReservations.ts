
import { useState } from "react";
import { ReservationWithChild } from "./useAdminReservations";
import { format, parse } from "date-fns";

export const useFilteredReservations = (reservations: ReservationWithChild[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  console.log("Selected date:", selectedDate);
  console.log("All reservations:", reservations);

  const filteredReservations = reservations?.filter((reservation) => {
    const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
    const searchMatch = searchQuery 
      ? fullName.includes(searchQuery.toLowerCase())
      : true;

    // Format both dates to ensure consistent comparison
    const reservationDateStr = format(new Date(reservation.reservation_date), "yyyy-MM-dd");

    console.log("Comparing dates:", {
      reservationDate: reservationDateStr,
      selectedDate: selectedDate,
      matches: selectedDate ? reservationDateStr === selectedDate : true
    });

    const dateMatch = selectedDate
      ? reservationDateStr === selectedDate
      : true;

    const classMatch = selectedClass === "all"
      ? true
      : reservation.children?.school_class === selectedClass;

    const getGroup = (schoolClass: string) => {
      if (["PS", "MS", "GS"].includes(schoolClass)) return "maternelle";
      if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass)) return "primaire";
      if (["6EME", "5EME", "4EME", "3EME"].includes(schoolClass)) return "ado";
      return "";
    };

    const groupMatch = selectedGroup === "all"
      ? true
      : getGroup(reservation.children?.school_class || "") === selectedGroup;

    return searchMatch && dateMatch && classMatch && groupMatch;
  });

  console.log("Filtered reservations:", filteredReservations);

  return {
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    selectedClass,
    setSelectedClass,
    selectedGroup,
    setSelectedGroup,
    filteredReservations
  };
};
