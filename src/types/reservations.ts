
import { Tables } from "@/integrations/supabase/types";

export type WednesdayReservationWithChild = Tables<"wednesday_reservations"> & {
  children: Tables<"children">;
  available_wednesdays: Tables<"available_wednesdays">;
};

export type HolidayReservationWithChild = Tables<"holiday_reservations"> & {
  children: Tables<"children">;
};
