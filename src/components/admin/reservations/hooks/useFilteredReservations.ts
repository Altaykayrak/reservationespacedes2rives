
import { useState, useEffect } from "react";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { format } from "date-fns";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";
import { usePagination } from "@/hooks/usePagination";

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

  // Configuration de la pagination pour les mercredis
  const wednesdayPagination = usePagination({
    data: filteredWednesdayReservations,
    itemsPerPage: 50
  });

  // Configuration de la pagination pour les vacances
  const holidayPagination = usePagination({
    data: filteredHolidayReservations,
    itemsPerPage: 50
  });

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
      
      // Debug: Rechercher spécifiquement les enfants Degryse
      const degrysePrevious = wednesdayReservations.filter(r => 
        r.children?.last_name.toLowerCase().includes('degryse')
      );
      if (degrysePrevious.length > 0) {
        console.log(`🎯 MERCREDI - Réservations Degryse trouvées AVANT filtrage:`, degrysePrevious.length);
        degrysePrevious.forEach(r => {
          console.log(`   - ID: ${r.id}, Enfant: ${r.children?.first_name} ${r.children?.last_name}, Classe: ${r.children?.school_class}`);
        });
      }

      const filtered = wednesdayReservations.filter(reservation => {
        // Debug spécial pour Degryse
        const isDegryse = reservation.children?.last_name.toLowerCase().includes('degryse');
        
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
        
        // Log spécial pour Degryse
        if (isDegryse) {
          console.log(`🔍 MERCREDI DEGRYSE - Enfant filtrage:`, {
            childId: reservation.child_id,
            name: fullName,
            searchQuery,
            searchMatch,
            dateMatch,
            classMatch,
            selectedGroup,
            groupMatch,
            finalMatch: isMatching,
            allFilters: { searchQuery, startDate, endDate, selectedClass, selectedGroup }
          });
        }

        return isMatching;
      });

      const degryseFinal = filtered.filter(r => 
        r.children?.last_name.toLowerCase().includes('degryse')
      );
      if (degrysePrevious.length > 0) {
        console.log(`✅ MERCREDI - Enfants Degryse APRÈS filtrage:`, degryseFinal.length);
        if (degryseFinal.length === 0) {
          console.log(`❌ MERCREDI - Tous les enfants Degryse ont été FILTRÉS`);
        }
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
      
      // Debug: Rechercher spécifiquement les enfants Degryse
      const degrysePrevious = holidayReservations.filter(r => 
        r.children?.last_name.toLowerCase().includes('degryse')
      );
      if (degrysePrevious.length > 0) {
        console.log(`🎯 VACANCES - Réservations Degryse trouvées AVANT filtrage:`, degrysePrevious.length);
        degrysePrevious.forEach(r => {
          console.log(`   - ID: ${r.id}, Enfant: ${r.children?.first_name} ${r.children?.last_name}, Classe: ${r.children?.school_class}, Période: ${r.period_id}`);
        });
      }

      const filtered = holidayReservations.filter(reservation => {
        // Debug spécial pour Degryse
        const isDegryse = reservation.children?.last_name.toLowerCase().includes('degryse');
        
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
        
        // Log spécial pour Degryse
        if (isDegryse) {
          console.log(`🔍 VACANCES DEGRYSE - Enfant filtrage:`, {
            childId: reservation.child_id,
            name: fullName,
            classe: reservation.children?.school_class,
            period_id: reservation.period_id,
            searchQuery,
            searchMatch,
            dateMatch,
            classMatch,
            selectedGroup,
            groupMatch,
            selectedPeriod,
            periodMatch,
            finalMatch: isMatching,
            allFilters: { searchQuery, startDate, endDate, selectedClass, selectedGroup, selectedPeriod }
          });
        }

        return isMatching;
      });

      const degryseFinal = filtered.filter(r => 
        r.children?.last_name.toLowerCase().includes('degryse')
      );
      if (degrysePrevious.length > 0) {
        console.log(`✅ VACANCES - Enfants Degryse APRÈS filtrage:`, degryseFinal.length);
        if (degryseFinal.length === 0) {
          console.log(`❌ VACANCES - Tous les enfants Degryse ont été FILTRÉS`);
        }
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
    holidayPeriods,
    // Expose pagination controls
    wednesdayPagination,
    holidayPagination
  };
};
