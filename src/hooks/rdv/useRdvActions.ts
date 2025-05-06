
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Rdv } from "@/types/rdv";
import { useToast } from "../use-toast";
import { format } from "date-fns";
import { useState } from "react";
import { useEmailNotification } from "../useEmailNotification";

export const useRdvActions = (
  userRdv: Rdv | null,
  setUserRdv: (rdv: Rdv | null) => void,
  setShowConfirmDialog: (show: boolean) => void,
  setReservationComplete: (complete: boolean) => void,
  setSelectedRdv: (rdv: Rdv | null) => void,
  setSelectedMotifs: (motifs: string[] | ((prev: string[]) => string[])) => void
) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSelectSlot = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setSelectedMotifs([]);
    setShowConfirmDialog(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirmDialog(false);
    setSelectedRdv(null);
  };

  const handleMotifSelection = (motif: string) => {
    setSelectedMotifs((prev: string[]) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      } else {
        return [...prev, motif];
      }
    });
  };

  const handleMotifChange = handleMotifSelection;

  const handleReservation = async (selectedRdv: Rdv, motifs: string[]) => {
    if (!user || !selectedRdv) return;

    try {
      setIsProcessing(true);
      const { error: updateError } = await supabase
        .from("rdv")
        .update({
          status: "réservé" as const, // Using const assertion to match the literal type
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

      setShowConfirmDialog(false);
      setReservationComplete(true);

      const updatedRdv: Rdv = {
        ...selectedRdv,
        status: "réservé", // This is typed correctly as the literal "réservé"
        user_id: user.id,
        motifs: motifs,
      };
      setUserRdv(updatedRdv);

      // Envoi d'un email de notification
      try {
        const emailResponse = await supabase.functions.invoke('send-reservation-email', {
          body: {
            rdvId: selectedRdv.id,
            motifs: motifs,
            userId: user.id,
            requestId: `rdv-${selectedRdv.id}-${Date.now()}`
          }
        });
        
        if (emailResponse.error) {
          console.error("Error sending email notification:", emailResponse.error);
        } else {
          console.log("Email notification sent successfully");
        }
      } catch (emailError) {
        console.error("Error in email notification:", emailError);
        // Ne pas bloquer le flux principal si l'envoi d'email échoue
      }

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

  const handleCompleteDialogClose = () => {
    setReservationComplete(false);
    navigate("/profile");
  };

  const handleCancelReservation = async () => {
    if (!userRdv) return;

    try {
      setIsProcessing(true);
      const { error } = await supabase
        .from("rdv")
        .update({
          status: "disponible" as const, // Using const assertion to match the literal type
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
    handleMotifChange,
    handleCompleteDialogClose,
    isProcessing
  };
};
