
export interface ReservationEmailRequest {
  childName?: string;
  childClass?: string; // School class of the child
  dates?: string[];
  period?: string;
  withoutMeal?: boolean[];
  earlyDropoff?: boolean[];
  reservationType?: 'holiday' | 'wednesday' | 'teen-holiday'; // Added 'teen-holiday'
  rdvId?: string;
  requestId?: string;
  userId?: string;
}
