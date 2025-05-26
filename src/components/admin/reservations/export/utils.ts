
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { HolidayReservationWithChild, WednesdayReservationWithChild } from "@/types/reservations";

export interface ClassData {
  children: {
    firstName: string;
    lastName: string;
    schoolClass: string;
    reservations: Map<string, string>;
  }[];
}

export interface ExportData {
  dates: string[];
  childrenByClass: Map<string, ClassData>;
}

// Interface for the child data structure used in this module
interface ChildData {
  id: string;
  first_name: string;
  last_name: string;
  school_class: string;
  profile: {
    school_city: string;
  };
}

export const formatDate = (dateStr: string, shortFormat: boolean = false) => {
  try {
    const date = parse(dateStr, "yyyy-MM-dd", new Date());
    
    if (shortFormat) {
      // Format court pour les en-têtes de colonne : Lu 07/07
      const dayShort = format(date, "EEEEEE", { locale: fr }); // Ex: Lu, Ma, Me
      const dayMonth = format(date, "dd/MM", { locale: fr }); // Ex: 07/07
      return `${dayShort} ${dayMonth}`;
    } else {
      // Format complet
      return format(date, "EEEE d MMMM", { locale: fr }).charAt(0).toUpperCase() + 
             format(date, "EEEE d MMMM", { locale: fr }).slice(1);
    }
  } catch (error) {
    console.error("Erreur lors du formatage de la date:", dateStr, error);
    return dateStr;
  }
};

export const prepareExportData = (
  wednesdayReservations: WednesdayReservationWithChild[] | null,
  holidayReservations: HolidayReservationWithChild[] | null
): ExportData => {
  // Récupérer toutes les dates uniques
  const allDates = new Set<string>();
  
  // Traiter les réservations du mercredi
  if (wednesdayReservations) {
    wednesdayReservations.forEach(reservation => {
      if (reservation.available_wednesdays?.date) {
        allDates.add(reservation.available_wednesdays.date);
      }
    });
  }
  
  // Traiter les réservations des vacances
  if (holidayReservations) {
    holidayReservations.forEach(reservation => {
      if (reservation.reservation_date) {
        allDates.add(reservation.reservation_date);
      }
    });
  }
  
  // Trier les dates
  const dates = Array.from(allDates).sort();
  
  // Map pour regrouper les enfants par classe
  const childrenByClass = new Map<string, ClassData>();
  
  // Fonction pour ajouter un enfant au map
  const addChild = (child: ChildData) => {
    const schoolClass = child.school_class;
    
    if (!childrenByClass.has(schoolClass)) {
      childrenByClass.set(schoolClass, { children: [] });
    }
    
    // Vérifier si l'enfant existe déjà dans la classe
    const existingChildIndex = childrenByClass.get(schoolClass)!.children.findIndex(
      c => c.firstName === child.first_name && c.lastName === child.last_name
    );
    
    if (existingChildIndex === -1) {
      // Si l'enfant n'existe pas encore, l'ajouter
      childrenByClass.get(schoolClass)!.children.push({
        firstName: child.first_name,
        lastName: child.last_name,
        schoolClass: child.school_class,
        reservations: new Map()
      });
    }
  };
  
  // Fonction pour marquer la réservation d'un enfant
  const addReservation = (child: ChildData, date: string, withoutMeal: boolean) => {
    const schoolClass = child.school_class;
    
    // Trouver l'enfant dans sa classe
    const childIndex = childrenByClass.get(schoolClass)!.children.findIndex(
      c => c.firstName === child.first_name && c.lastName === child.last_name
    );
    
    if (childIndex !== -1) {
      // Mettre à jour le statut de réservation
      const reservationType = withoutMeal ? "Sans repas" : "Avec repas";
      childrenByClass.get(schoolClass)!.children[childIndex].reservations.set(date, reservationType);
    }
  };
  
  // Traiter toutes les réservations du mercredi
  if (wednesdayReservations) {
    wednesdayReservations.forEach(reservation => {
      if (reservation.children && reservation.available_wednesdays?.date) {
        addChild(reservation.children);
        addReservation(
          reservation.children,
          reservation.available_wednesdays.date,
          !!reservation.without_meal
        );
      }
    });
  }
  
  // Traiter toutes les réservations des vacances
  if (holidayReservations) {
    holidayReservations.forEach(reservation => {
      if (reservation.children && reservation.reservation_date) {
        addChild(reservation.children);
        addReservation(
          reservation.children,
          reservation.reservation_date,
          !!reservation.without_meal
        );
      }
    });
  }
  
  return { dates, childrenByClass };
};
