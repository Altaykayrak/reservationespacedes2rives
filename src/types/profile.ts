
export interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  automatic_payment: boolean;
  accepted_cgu: boolean;
  is_waiting: boolean;
  is_closed: boolean;
  hide_rdv_access: boolean;
  hide_wednesday_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  school_class: string;
  profile_id: string;
}
