
import { useState } from "react";
import { WednesdayReservationWithChild } from "./useAdminReservations";
import { format } from "date-fns";

export const useFilteredReservations = (reservations: WednesdayReservationWithChild[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");

  console.log("All reservations before filtering:", reservations?.map(r => ({
    date: r.available_wednesdays.date,
    child: `${r.children?.first_name} ${r.children?.last_name}`,
    class: r.children?.school_class,
    period_id: r.wednesday_id
  })));

  const filteredReservations = reservations?.filter((reservation) => {
    const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
    const searchMatch = searchQuery 
      ? fullName.includes(searchQuery.toLowerCase())
      : true;

    const reservationDateStr = format(new Date(reservation.available_wednesdays.date), "yyyy-MM-dd");

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
