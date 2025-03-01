
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rdv } from "@/types/rdv";
import { useToast } from "../use-toast";
import { format } from "date-fns";
import { useState } from "react";

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
  const [isProcessing, setIsProcessing] = useState(false);

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

  // Handle motif selection (for the form in the confirmation dialog)
  const handleMotifSelection = (motif: string) => {
    setSelectedMotifs((prev) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      } else {
        return [...prev, motif];
      }
    });
  };

  // Alias for handleMotifSelection to match useRdv.ts expectations
  const handleMotifChange = handleMotifSelection;

  // Handle reservation submission
  const handleReservation = async (selectedRdv: Rdv, motifs: string[]) => {
    if (!user || !selectedRdv) return;

    try {
      setIsProcessing(true);
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
        )} à ${updatedRdv.heure_debut}.`,
      });
    } catch (error) {
      console.error("Error in handleReservation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle complete dialog close (navigation after successful reservation)
  const handleCompleteDialogClose = () => {
    setReservationComplete(false);
    navigate("/profile");
  };

  // Handle cancel reservation
  const handleCancelReservation = async () => {
    if (!userRdv) return;

    try {
      setIsProcessing(true);
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
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkUserReservation,
    handleSelectSlot,
    handleCloseConfirm,
    handleReservation,
    handleMotifSelection,
    handleCancelReservation,
    // Add these to match useRdv.ts expectations
    handleMotifChange,
    handleCompleteDialogClose,
    isProcessing
  };
};
