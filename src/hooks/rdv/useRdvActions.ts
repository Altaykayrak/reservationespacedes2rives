
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rdv } from "@/types/rdv";
import { useToast } from "../use-toast";
import { format } from "date-fns";

export const useRdvActions = (
  userRdv: Rdv | null,
  setUserRdv: (rdv: Rdv | null) => void,
  setShowConfirmDialog: (show: boolean) => void,
  setReservationComplete: (complete: boolean) => void,
  setSelectedRdv: (rdv: Rdv | null) => void,
  setSelectedMotifs: (motifs: string[]) => void
) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to check if a user already has a reservation
  const checkUserReservation = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("rdv")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user reservation:", error);
        return null;
      }

      return data as Rdv | null;
    } catch (error) {
      console.error("Error in checkUserReservation:", error);
      return null;
    }
  };

  // Handle slot selection
  const handleSelectSlot = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setSelectedMotifs([]);
    setShowConfirmDialog(true);
  };

  // Close the confirmation dialog
  const handleCloseConfirm = () => {
    setShowConfirmDialog(false);
    setSelectedRdv(null);
  };

  // Handle reservation submission
  const handleReservation = async (selectedRdv: Rdv, motifs: string[]) => {
    if (!user || !selectedRdv) return;

    try {
      // Update the RDV to mark it as reserved
      const { error: updateError } = await supabase
        .from("rdv")
        .update({
          is_available: false,
          user_id: user.id,
          motifs: motifs,
        })
        .eq("id", selectedRdv.id);

      if (updateError) {
        toast({
          title: "Erreur",
          description: "Impossible de réserver ce créneau.",
          variant: "destructive",
        });
        console.error("Error updating RDV:", updateError);
        return;
      }

      // Close the confirmation dialog and show success message
      setShowConfirmDialog(false);
      setReservationComplete(true);

      // Refresh the user's RDV
      const updatedRdv = {
        ...selectedRdv,
        is_available: false,
        user_id: user.id,
        motifs: motifs,
      };
      setUserRdv(updatedRdv);

      toast({
        title: "Réservation réussie",
        description: `Votre rendez-vous est confirmé pour le ${format(
          new Date(updatedRdv.date),
          "dd/MM/yyyy"
        )} à ${updatedRdv.time}.`,
      });
    } catch (error) {
      console.error("Error in handleReservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    }
  };

  // Handle motif selection
  const handleMotifSelection = (motif: string) => {
    setSelectedMotifs((prev) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      } else {
        return [...prev, motif];
      }
    });
  };

  // Handle cancel reservation
  const handleCancelReservation = async () => {
    if (!userRdv) return;

    try {
      // Update the RDV to mark it as available again
      const { error } = await supabase
        .from("rdv")
        .update({
          is_available: true,
          user_id: null,
          motifs: [],
        })
        .eq("id", userRdv.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'annuler votre réservation.",
          variant: "destructive",
        });
        console.error("Error canceling RDV:", error);
        return;
      }

      // Update UI state
      setUserRdv(null);
      
      toast({
        title: "Annulation réussie",
        description: "Votre rendez-vous a été annulé avec succès.",
      });
    } catch (error) {
      console.error("Error in handleCancelReservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'annulation.",
        variant: "destructive",
      });
    }
  };

  return {
    checkUserReservation,
    handleSelectSlot,
    handleCloseConfirm,
    handleReservation,
    handleMotifSelection,
    handleCancelReservation,
  };
};
