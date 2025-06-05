
import { useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { refreshSessionIfNeeded } from "./sessionUtils";

export const useSessionMonitor = (
  session: Session | null,
  safeSetState: <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) => void,
  setSession: React.Dispatch<React.SetStateAction<Session | null>>,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  isMountedRef: React.MutableRefObject<boolean>
) => {
  useEffect(() => {
    // Vérifier périodiquement la validité de la session
    const sessionCheckInterval = setInterval(async () => {
      if (session && isMountedRef.current) {
        const refreshedSession = await refreshSessionIfNeeded(session);
        if (refreshedSession && refreshedSession !== session) {
          safeSetState(setSession, refreshedSession);
          safeSetState(setUser, refreshedSession.user);
        }
      }
    }, 60000); // Vérifier toutes les minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [session, safeSetState, setSession, setUser, isMountedRef]);
};
