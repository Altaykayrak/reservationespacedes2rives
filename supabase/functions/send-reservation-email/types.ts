
export interface ReservationEmailRequest {
  rdvId?: string;
  motifs?: string[];
  userId?: string;
  reservationType?: string;
  childName?: string;
  childClass?: string;
  dates?: string[];
  period?: string;
  withoutMeal?: boolean[];
  earlyDropoff?: boolean[];
  requestId?: string;
  userEmail?: string;
  userName?: string;
}

export interface EventDetails {
  summary: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  uid: string;
  organizer?: {
    email: string;
    name: string;
  };
  attendee?: {
    email: string;
    name: string;
  };
}
