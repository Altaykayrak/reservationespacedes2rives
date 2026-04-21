
import { WednesdayReservationWithChild, HolidayReservationWithChild } from "@/types/reservations";

export interface ReservationData {
  status: string;
  early_dropoff: boolean;
  without_meal: boolean;
}

export interface ExportData {
  dates: string[];
  childrenByClass: Map<string, {
    children: {
      firstName: string;
      lastName: string;
      schoolClass: string;
      reservations: Map<string, ReservationData>;
    }[];
  }>;
}

export interface ExportButtonsProps {
  wednesdayReservations: WednesdayReservationWithChild[] | null;
  holidayReservations: HolidayReservationWithChild[] | null;
  startDate: string;
  endDate: string;
  selectedGroup?: string;
}
