
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const useRdvAuth = () => {
  const { user, loading, initialized } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  return {
    user,
    loading: loading || !initialized || isChecking
  };
};
