
import { Tables } from "@/integrations/supabase/types";

type ChildProfile = {
  school_city: string;
};

type ChildWithProfile = {
  id: string;
  first_name: string;
  last_name: string;
  school_class: string;
  profile: ChildProfile;
};

export type WednesdayReservationWithChild = {
  id: string;
  child_id: string;
  wednesday_id: string;
  without_meal: boolean;
  early_dropoff: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  children: ChildWithProfile;
  available_wednesdays: {
    id: string;
    date: string;
    max_participants_kindergarten: number;
    max_participants_primary: number;
  };
};

export type HolidayReservationWithChild = {
  id: string;
  child_id: string;
  period_id: string;
  reservation_date: string;
  reservation_number: string;
  without_meal: boolean;
  early_dropoff: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  children: ChildWithProfile;
  available_holiday_periods: Tables<"available_holiday_periods">;
};
