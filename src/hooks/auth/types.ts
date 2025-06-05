
import { Session, User } from "@supabase/supabase-js";

// Type d'état de l'authentification pour une meilleure gestion
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  initialized: boolean;
}

export interface AuthHookReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  initialized: boolean;
  isAuthenticated: boolean;
}
