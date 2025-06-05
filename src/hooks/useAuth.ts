
import { useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthStatus, AuthHookReturn } from "./auth/types";
import { useAuthStateManager } from "./auth/authStateManager";
import { useAuthInitializer } from "./auth/authInitializer";
import { useSessionMonitor } from "./auth/sessionMonitor";
import { createSignOut } from "./auth/signOut";

export const useAuth = (): AuthHookReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [initialized, setInitialized] = useState(false);
  
  const { 
    handleAuthStateChange, 
    cleanup, 
    markAsMounted, 
    safeSetState, 
    isMountedRef 
  } = useAuthStateManager();
  
  // S'assurer que le composant est considéré comme monté
  markAsMounted();
  
  const setters = {
    setSession,
    setUser,
    setStatus,
    setInitialized
  };

  // Wrapper pour handleAuthStateChange avec les setters
  const wrappedHandleAuthStateChange = (event: string, newSession: Session | null) => {
    handleAuthStateChange(event, newSession, setters, initialized);
  };

  // Initialiser l'authentification
  useAuthInitializer(
    wrappedHandleAuthStateChange,
    safeSetState,
    setters,
    isMountedRef
  );

  // Surveiller la session
  useSessionMonitor(session, safeSetState, setSession, setUser, isMountedRef);

  // Créer la fonction de déconnexion
  const signOut = createSignOut(safeSetState, { setUser, setSession, setStatus }, session);

  // Nettoyage lors du démontage (appelé dans le composant parent)
  const cleanupRef = cleanup;

  return { 
    user, 
    session, 
    loading: status === 'loading', 
    signOut, 
    initialized,
    isAuthenticated: status === 'authenticated'
  };
};
