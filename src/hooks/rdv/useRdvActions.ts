
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Rdv } from "@/types/rdv";

export const useRdvActions = (
  user: { id: string } | null,
  setSelectedMotifs: (fn: (prev: string[]) => string[]) => void,
  setSelectedRdv: (rdv: Rdv | null) => void,
  setShowConfirmDialog: (show: boolean) => void,
  setReservationComplete: (complete: boolean) => void,
  setUserRdv: (rdv: Rdv | null) => void,
  setIsLoading: (loading: boolean) => void,
  fetchUserRdv: () => void
) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle selecting a motif
  const handleMotifChange = (motif: string) => {
    setSelectedMotifs((prev) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      }
      return [...prev, motif];
    });
  };

  // Handle reservation
  const handleReservation = async (selectedRdv: Rdv | null, selectedMotifs: string[]) => {
    if (!user || !selectedRdv || selectedMotifs.length === 0) {
      toast({
        title: "Information requise",
        description: "Veuillez sélectionner au moins un motif",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      setIsLoading(true);
      
      const { error } = await supabase
        .from('rdv')
        .update({
          user_id: user.id,
          motifs: selectedMotifs,
          status: 'réservé'
        })
        .eq('id', selectedRdv.id);

      if (error) throw error;

      const { error: emailError } = await supabase.functions.invoke('send-reservation-email', {
        body: {
          rdvId: selectedRdv.id,
          motifs: selectedMotifs,
          userId: user.id
        }
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
      }

      setShowConfirmDialog(false);
      setReservationComplete(true);
      
      setUserRdv({
        ...selectedRdv,
        motifs: selectedMotifs,
        user_id: user.id,
        status: 'réservé'
      });
      
      toast({
        title: "Réservation confirmée",
        description: "Votre rendez-vous a été réservé avec succès",
      });
    } catch (error) {
      console.error("Error making reservation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la réservation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleSelectSlot = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setSelectedMotifs([]);
    setShowConfirmDialog(true);
  };

  const handleCompleteDialogClose = () => {
    setReservationComplete(false);
    setSelectedRdv(null);
    fetchUserRdv();
  };

  return {
    handleMotifChange,
    handleReservation,
    handleSelectSlot,
    handleCompleteDialogClose,
    isProcessing
  };
};
