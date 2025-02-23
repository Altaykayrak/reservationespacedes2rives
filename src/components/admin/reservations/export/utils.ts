
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";
import { ExportData } from "./types";

export const getAllDates = (
  wednesdayReservations: WednesdayReservationWithChild[] | null,
  holidayReservations: HolidayReservationWithChild[] | null
) => {
  const dates = new Set<string>();
  
  wednesdayReservations?.forEach(res => {
    dates.add(res.available_wednesdays.date);
  });
  
  holidayReservations?.forEach(res => {
    dates.add(res.reservation_date);
  });
  
  return Array.from(dates).sort();
};

export const prepareExportData = (
  wednesdayReservations: WednesdayReservationWithChild[] | null,
  holidayReservations: HolidayReservationWithChild[] | null
): ExportData => {
  const dates = getAllDates(wednesdayReservations, holidayReservations);
  const childrenByClass = new Map<string, {
    children: {
      firstName: string;
      lastName: string;
      schoolClass: string;
      reservations: Map<string, string>;
    }[];
  }>();

  const addChildToClass = (
    child: {
      first_name: string;
      last_name: string;
      school_class: string;
    },
    date: string,
    withoutMeal: boolean
  ) => {
    const schoolClass = child.school_class;
    const classData = childrenByClass.get(schoolClass) || { children: [] };
    
    let childData = classData.children.find(
      c => c.firstName === child.first_name && c.lastName === child.last_name
    );
    
    if (!childData) {
      childData = {
        firstName: child.first_name,
        lastName: child.last_name,
        schoolClass: child.school_class,
        reservations: new Map<string, string>()
      };
      classData.children.push(childData);
    }
    
    childData.reservations.set(date, withoutMeal ? "Sans repas" : "Avec repas");
    childrenByClass.set(schoolClass, classData);
  };

  wednesdayReservations?.forEach(res => {
    addChildToClass(
      res.children,
      res.available_wednesdays.date,
      res.without_meal
    );
  });

  holidayReservations?.forEach(res => {
    addChildToClass(
      res.children,
      res.reservation_date,
      res.without_meal
    );
  });

  return { dates, childrenByClass };
};

export const formatDate = (date: string) => {
  return format(new Date(date), "EEE dd MMM", { locale: fr });
};
