
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useAccessControl = () => {
  const { user } = useAuth();
  const [rdvAccess, setRdvAccess] = useState(true);
  const [wednesdayAccess, setWednesdayAccess] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("hide_rdv_access, hide_wednesday_access")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur lors de la vérification des droits d'accès:", error);
        } else if (profile) {
          setRdvAccess(!profile.hide_rdv_access);
          setWednesdayAccess(!profile.hide_wednesday_access);
        }
      } catch (error) {
        console.error("Exception lors de la vérification des droits d'accès:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user?.id]);

  return {
    rdvAccess,
    wednesdayAccess,
    loading
  };
};
