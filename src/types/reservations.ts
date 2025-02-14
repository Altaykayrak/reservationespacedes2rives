
import { Tables } from "@/integrations/supabase/types";

export type WednesdayReservationWithChild = {
  id: string;
  child_id: string;
  wednesday_id: string;
  without_meal: boolean;
  early_dropoff: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  children: {
    id: string;
    first_name: string;
    last_name: string;
    school_class: string;
  };
  available_wednesdays: {
    id: string;
    date: string;
    max_participants_kindergarten: number;
    max_participants_primary: number;
  };
};

export type HolidayReservationWithChild = Tables<"holiday_reservations"> & {
  children: Tables<"children">;
  available_holiday_periods: Tables<"available_holiday_periods">;
};
