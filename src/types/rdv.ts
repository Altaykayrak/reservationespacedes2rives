
export type Rdv = {
  id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  user_id: string | null;
  motifs: string[];
  status: 'disponible' | 'réservé';
  created_at: string;
  updated_at: string;
  // Joined data from profiles
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
};

export type RdvFormValues = {
  date: Date;
  heure_debut: string;
  heure_fin: string;
};

export type RdvReservationFormValues = {
  motifs: string[];
};

export const MOTIFS_OPTIONS = [
  "Garderie du matin",
  "Périscolaire",
  "Mercredi"
];
