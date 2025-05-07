
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Rdv } from "@/types/rdv";

export const useRdvActions = (
  userRdv: Rdv | null,
  setUserRdv: (rdv: Rdv | null) => void,
  setShowConfirmDialog: (show: boolean) => void,
  setReservationComplete: (complete: boolean) => void,
  setSelectedRdv: (rdv: Rdv | null) => void,
  setSelectedMotifs: React.Dispatch<React.SetStateAction<string[]>>
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMotifChange = (motif: string) => {
    setSelectedMotifs((prev: string[]) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      } else {
        return [...prev, motif];
      }
    });
  };

  const handleMotifSelection = (motifs: string[]) => {
    setSelectedMotifs(motifs);
  };

  const handleReservation = async (rdv: Rdv | null, motifs: string[]) => {
    if (!rdv) return;

    try {
      setIsProcessing(true);
      
      // Get user profile info for the calendar invitation
      const { data: userData } = await supabase.auth.getUser();
      
      // Get more user details from the profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userData.user?.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile data:", profileError);
      }
      
      const userName = profileData?.first_name && profileData?.last_name 
        ? `${profileData.first_name} ${profileData.last_name}` 
        : userData.user?.email?.split('@')[0] || 'Utilisateur';
      
      const userEmail = userData.user?.email;

      // Update the RDV status to reserved
      const { error } = await supabase
        .from("rdv")
        .update({
          status: "réservé",
          user_id: userData.user?.id,
          motifs: motifs,
        })
        .eq("id", rdv.id);

      if (error) throw error;

      // Préparation de l'identifiant unique pour la demande de réservation
      const requestId = `rdv-${rdv.id}-${Date.now()}`;

      // Send notification email with user info
      const { error: emailError } = await supabase.functions.invoke(
        "send-reservation-email",
        {
          body: {
            rdvId: rdv.id,
            motifs: motifs,
            userId: userData.user?.id,
            requestId,
            userEmail,
            userName
          },
        }
      );

      if (emailError) {
        console.error("Erreur lors de l'envoi de l'email:", emailError);
      }

      // Update local state
      setUserRdv({
        ...rdv,
        status: "réservé",
        user_id: userData.user?.id || null,
        motifs: motifs,
      });

      setShowConfirmDialog(false);
      setReservationComplete(true);
      toast.success("Votre rendez-vous a été réservé avec succès!");
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      toast.error(
        "Une erreur est survenue lors de la réservation. Veuillez réessayer."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSlot = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setSelectedMotifs([]);
    setShowConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmDialog(false);
  };

  const handleCompleteDialogClose = () => {
    setReservationComplete(false);
  };

  return {
    handleMotifChange,
    handleMotifSelection,
    handleReservation,
    handleSelectSlot,
    handleCloseConfirm,
    handleCompleteDialogClose,
    isProcessing,
  };
};
