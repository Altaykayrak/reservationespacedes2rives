
import { useState, useEffect } from "react";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { format } from "date-fns";
import { getGroupNameForPeriod, getGroupName } from "@/utils/schoolClassUtils";
import { supabase } from "@/integrations/supabase/client";

type SortOrder = "date" | "name";

interface ClassMapping {
  periodId: string;
  schoolClass: string;
  category: string | null;
}

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
  const [classMappings, setClassMappings] = useState<ClassMapping[]>([]);
  const [filteredWednesdayReservations, setFilteredWednesdayReservations] = useState<WednesdayReservationWithChild[] | null>(null);
  const [filteredHolidayReservations, setFilteredHolidayReservations] = useState<HolidayReservationWithChild[] | null>(null);

  // Charger tous les mappings de classes au démarrage
  useEffect(() => {
    const loadMappings = async () => {
      try {
        const { data, error } = await supabase
          .from("holiday_period_class_mappings")
          .select("*");

        if (error) throw error;
        
        const mappings: ClassMapping[] = data.map(item => ({
          periodId: item.holiday_period_id,
          schoolClass: item.school_class,
          category: item.category
        }));
        
        setClassMappings(mappings);
      } catch (error) {
        console.error("Erreur lors du chargement des mappings de classes:", error);
      }
    };
    
    loadMappings();
  }, []);

  // Obtenir le groupe pour une classe et une période spécifique
  const getClassGroup = (schoolClass: string, periodId?: string): string => {
    if (!periodId) return getGroupName(schoolClass);
    
    // Chercher un mapping spécifique
    const mapping = classMappings.find(m => 
      m.periodId === periodId && 
      m.schoolClass.toLowerCase() === schoolClass.toLowerCase()
    );
    
    if (mapping) {
      return mapping.category || ""; // Si category est null, retourner chaîne vide
    }
    
    // Pas de mapping trouvé, utiliser la catégorisation par défaut
    return getGroupName(schoolClass);
  };

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

        // Pour les mercredis, utiliser le mapping standard
        let groupMatch = selectedGroup === "all" ? true : false;
        if (selectedGroup !== "all" && reservation.children?.school_class) {
          const group = getGroupName(reservation.children.school_class);
          groupMatch = group === selectedGroup;
        }

        return searchMatch && dateMatch && classMatch && groupMatch;
      });

      setFilteredWednesdayReservations(sortReservations(filtered));
    } else {
      setFilteredWednesdayReservations(null);
    }
  }, [wednesdayReservations, searchQuery, startDate, endDate, selectedClass, selectedGroup, sortOrder]);

  // Effet pour filtrer les réservations de vacances
  useEffect(() => {
    if (holidayReservations && classMappings.length > 0) {
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

        // Pour les vacances, utiliser le mapping spécifique à la période
        let groupMatch = selectedGroup === "all" ? true : false;
        if (selectedGroup !== "all" && reservation.children?.school_class) {
          const group = getClassGroup(reservation.children.school_class, reservation.period_id);
          groupMatch = group === selectedGroup;
        }
        
        // Filtre par période
        const periodMatch = selectedPeriod === "all" 
          ? true 
          : reservation.period_id === selectedPeriod;

        return searchMatch && dateMatch && classMatch && groupMatch && periodMatch;
      });

      setFilteredHolidayReservations(sortReservations(filtered));
    } else {
      setFilteredHolidayReservations(null);
    }
  }, [holidayReservations, classMappings, searchQuery, startDate, endDate, selectedClass, selectedGroup, selectedPeriod, sortOrder]);

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
