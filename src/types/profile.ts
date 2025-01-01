export interface ProfileData {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  school_city: string
}

export interface Child {
  id: string
  first_name: string
  last_name: string
  school_class: string
  profile_id: string
}