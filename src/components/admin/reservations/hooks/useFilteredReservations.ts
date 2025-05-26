
import { useState, useEffect } from "react";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { format } from "date-fns";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";

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
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [filteredWednesdayReservations, setFilteredWednesdayReservations] = useState<WednesdayReservationWithChild[] | null>(null);
  const [filteredHolidayReservations, setFilteredHolidayReservations] = useState<HolidayReservationWithChild[] | null>(null);

  // Utiliser notre hook central pour les catégories
  const { getClassCategorySync } = useSchoolClassCategories();
  
  // Pour déboguer le problème de filtrage
  useEffect(() => {
    if (selectedGroup !== 'all') {
      console.log(`🔍 Filtrage par groupe: "${selectedGroup}"`);
    }
  }, [selectedGroup]);

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

  // Effet pour filtrer les réservations du mercredi
  useEffect(() => {
    if (wednesdayReservations) {
      console.log("🔍 Début filtrage mercredi, nombre total:", wednesdayReservations.length);
      
      // Rechercher spécifiquement l'enfant avec l'ID mentionné
      const targetChildId = "272c2d54-e3f3-4146-b5b7-a47385a2c1ab";
      const targetReservations = wednesdayReservations.filter(r => r.child_id === targetChildId);
      if (targetReservations.length > 0) {
        console.log(`🎯 Réservations mercredi trouvées pour l'enfant ${targetChildId} avant filtrage:`, targetReservations);
        targetReservations.forEach(r => {
          console.log(`  - Réservation ID: ${r.id}, Enfant: ${r.children?.first_name} ${r.children?.last_name}`);
        });
      }

      const filtered = wednesdayReservations.filter(reservation => {
        const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
        const searchMatch = searchQuery 
          ? fullName.includes(searchQuery.toLowerCase())
          : true;

        const reservationDateStr = format(new Date(reservation.available_wednesdays.date), "yyyy-MM-dd");

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

        // Pour les mercredis, utiliser notre fonction centrale
        let groupMatch = selectedGroup === "all" ? true : false;
        if (selectedGroup !== "all" && reservation.children?.school_class) {
          const group = getClassCategorySync(reservation.children.school_class);
          groupMatch = group === selectedGroup;
        }

        const isMatching = searchMatch && dateMatch && classMatch && groupMatch;
        
        // Log spécial pour l'enfant ciblé
        if (reservation.child_id === targetChildId) {
          console.log(`🔍 Enfant ${targetChildId} - Mercredi filtrage:`, {
            childId: reservation.child_id,
            name: fullName,
            searchQuery,
            searchMatch,
            dateMatch,
            classMatch,
            groupMatch,
            finalMatch: isMatching,
            filters: { searchQuery, startDate, endDate, selectedClass, selectedGroup }
          });
        }

        return isMatching;
      });

      const filteredTargetReservations = filtered.filter(r => r.child_id === targetChildId);
      if (filteredTargetReservations.length > 0) {
        console.log(`✅ Enfant ${targetChildId} - Réservations mercredi APRÈS filtrage:`, filteredTargetReservations.length);
      } else if (targetReservations.length > 0) {
        console.log(`❌ Enfant ${targetChildId} - Réservations mercredi FILTRÉES (non visibles):`, targetReservations.length);
      }

      console.log("✅ Fin filtrage mercredi, nombre filtré:", filtered.length);
      setFilteredWednesdayReservations(sortReservations(filtered));
    } else {
      setFilteredWednesdayReservations(null);
    }
  }, [wednesdayReservations, searchQuery, startDate, endDate, selectedClass, selectedGroup, sortOrder, getClassCategorySync]);

  // Effet pour filtrer les réservations de vacances
  useEffect(() => {
    if (holidayReservations) {
      console.log("🔍 Début filtrage vacances, nombre total:", holidayReservations.length);
      
      // Rechercher spécifiquement l'enfant avec l'ID mentionné
      const targetChildId = "272c2d54-e3f3-4146-b5b7-a47385a2c1ab";
      const targetReservations = holidayReservations.filter(r => r.child_id === targetChildId);
      if (targetReservations.length > 0) {
        console.log(`🎯 Réservations vacances trouvées pour l'enfant ${targetChildId} avant filtrage:`, targetReservations);
        targetReservations.forEach(r => {
          console.log(`  - Réservation ID: ${r.id}, Enfant: ${r.children?.first_name} ${r.children?.last_name}`);
        });
      }

      const filtered = holidayReservations.filter(reservation => {
        const fullName = `${reservation.children?.first_name} ${reservation.children?.last_name}`.toLowerCase();
        const searchMatch = searchQuery 
          ? fullName.includes(searchQuery.toLowerCase())
          : true;

        const reservationDateStr = format(new Date(reservation.reservation_date), "yyyy-MM-dd");

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

        // Pour les vacances, utiliser notre fonction centrale avec la période spécifique
        let groupMatch = selectedGroup === "all" ? true : false;
        if (selectedGroup !== "all" && reservation.children?.school_class) {
          const group = getClassCategorySync(reservation.children.school_class, reservation.period_id);
          groupMatch = group === selectedGroup;
        }
        
        // Filtre par période
        const periodMatch = selectedPeriod === "all" 
          ? true 
          : reservation.period_id === selectedPeriod;

        const isMatching = searchMatch && dateMatch && classMatch && groupMatch && periodMatch;
        
        // Log spécial pour l'enfant ciblé
        if (reservation.child_id === targetChildId) {
          console.log(`🔍 Enfant ${targetChildId} - Vacances filtrage:`, {
            childId: reservation.child_id,
            name: fullName,
            searchQuery,
            searchMatch,
            dateMatch,
            classMatch,
            groupMatch,
            periodMatch,
            finalMatch: isMatching,
            filters: { searchQuery, startDate, endDate, selectedClass, selectedGroup, selectedPeriod }
          });
        }

        return isMatching;
      });

      const filteredTargetReservations = filtered.filter(r => r.child_id === targetChildId);
      if (filteredTargetReservations.length > 0) {
        console.log(`✅ Enfant ${targetChildId} - Réservations vacances APRÈS filtrage:`, filteredTargetReservations.length);
      } else if (targetReservations.length > 0) {
        console.log(`❌ Enfant ${targetChildId} - Réservations vacances FILTRÉES (non visibles):`, targetReservations.length);
      }

      console.log("✅ Fin filtrage vacances, nombre filtré:", filtered.length);
      setFilteredHolidayReservations(sortReservations(filtered));
    } else {
      setFilteredHolidayReservations(null);
    }
  }, [holidayReservations, searchQuery, startDate, endDate, selectedClass, selectedGroup, selectedPeriod, sortOrder, getClassCategorySync]);

  // Extrait les périodes uniques des réservations de vacances
  const holidayPeriods = holidayReservations
    ? [...new Set(holidayReservations.map(r => r.period_id))]
        .filter(Boolean)
        .map(periodId => {
          const reservation = holidayReservations.find(r => r.period_id === periodId);
          return {
            id: periodId,
            name: reservation?.available_holiday_periods?.name || "Période inconnue"
          };
        })
    : [];

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
    sortOrder,
    setSortOrder,
    filteredWednesdayReservations,
    filteredHolidayReservations,
    holidayPeriods
  };
};
