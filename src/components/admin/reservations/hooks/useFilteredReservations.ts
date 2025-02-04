
import { useState } from "react";
import { ReservationWithChild } from "./useAdminReservations";

export const useFilteredReservations = (reservations: ReservationWithChild[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  const filteredReservations = reservations?.filter((reservation) => {
    const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
    const searchMatch = searchQuery 
      ? fullName.includes(searchQuery.toLowerCase())
      : true;

    const dateMatch = selectedDate
      ? reservation.reservation_date === selectedDate
      : true;

    const classMatch = selectedClass === "all"
      ? true
      : reservation.children?.school_class === selectedClass;

    const getGroup = (schoolClass: string) => {
      if (["PS", "MS", "GS"].includes(schoolClass)) return "maternelle";
      if (["CP", "CE1", "CE2", "CM1", "CM2"].includes(schoolClass)) return "primaire";
      return "ado";
    };

    const groupMatch = selectedGroup === "all"
      ? true
      : getGroup(reservation.children?.school_class || "") === selectedGroup;

    return searchMatch && dateMatch && classMatch && groupMatch;
  });

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
