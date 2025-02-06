
import { useState } from "react";
import { ReservationWithChild } from "./useAdminReservations";
import { format } from "date-fns";

export const useFilteredReservations = (reservations: ReservationWithChild[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  console.log("All reservations before filtering:", reservations?.map(r => ({
    date: r.reservation_date,
    child: `${r.children?.first_name} ${r.children?.last_name}`,
    class: r.children?.school_class,
    period_id: r.period_id
  })));

  const filteredReservations = reservations?.filter((reservation) => {
    const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
    const searchMatch = searchQuery 
      ? fullName.includes(searchQuery.toLowerCase())
      : true;

    const reservationDateStr = format(new Date(reservation.reservation_date), "yyyy-MM-dd");

    console.log("Filtering reservation:", {
      child: `${reservation.children?.first_name} ${reservation.children?.last_name}`,
      reservationDate: reservationDateStr,
      selectedDate: selectedDate,
      dateMatches: selectedDate ? reservationDateStr === selectedDate : true,
      withoutMeal: reservation.without_meal,
      earlyDropoff: reservation.early_dropoff,
      periodId: reservation.period_id,
      status: reservation.status
    });

    let dateMatch = true;
    if (selectedDate) {
      dateMatch = reservationDateStr === selectedDate;
    }

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

    console.log("Match results:", {
      child: `${reservation.children?.first_name} ${reservation.children?.last_name}`,
      searchMatch,
      dateMatch,
      classMatch,
      groupMatch,
      willShow: searchMatch && dateMatch && classMatch && groupMatch
    });

    return searchMatch && dateMatch && classMatch && groupMatch;
  });

  console.log("Final filtered reservations:", filteredReservations?.map(r => ({
    date: r.reservation_date,
    child: `${r.children?.first_name} ${r.children?.last_name}`,
    class: r.children?.school_class
  })));

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
