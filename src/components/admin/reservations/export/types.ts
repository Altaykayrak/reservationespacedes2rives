
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

export interface ExportData {
  dates: string[];
  childrenByClass: Map<string, {
    children: {
      firstName: string;
      lastName: string;
      schoolClass: string;
      reservations: Map<string, string>;
    }[];
  }>;
}

export interface ExportButtonsProps {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  startDate: string;
  endDate: string;
}
