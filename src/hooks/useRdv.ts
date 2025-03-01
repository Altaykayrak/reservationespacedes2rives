
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Rdv } from "@/types/rdv";
import { format } from "date-fns";

export const useRdv = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rdvList, setRdvList] = useState<Rdv[]>([]);
  const [userRdv, setUserRdv] = useState<Rdv | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Rdv[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRdv, setSelectedRdv] = useState<Rdv | null>(null);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const summerRange = {
    start: new Date(2025, 6, 1),
    end: new Date(2025, 7, 31)
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserRdv();
    }
  }, [user]);

  const fetchUserRdv = async () => {
    try {
      setIsLoading(true);
      
      const { data: userRdvData, error: userRdvError } = await supabase
        .from('rdv')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'réservé')
        .order('date')
        .limit(1);
      
      if (userRdvError) throw userRdvError;
      
      if (userRdvData && userRdvData.length > 0) {
        setUserRdv(userRdvData[0] as unknown as Rdv);
      } else {
        await fetchRdvs();
      }
    } catch (error) {
      console.error("Error fetching user RDV:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger votre rendez-vous",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRdvs = async () => {
    try {
      const { data, error } = await supabase
        .from('rdv')
        .select('*')
        .eq('status', 'disponible')
        .order('date')
        .order('heure_debut');

      if (error) throw error;
      setRdvList(data as unknown as Rdv[]);
    } catch (error) {
      console.error("Error fetching RDVs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux disponibles",
        variant: "destructive",
      });
    }
  };

  const filterSlotsByDate = (date: Date | undefined) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    const formattedSelectedDate = format(date, 'yyyy-MM-dd');
    const filteredSlots = rdvList.filter(
      slot => slot.date === formattedSelectedDate
    );
    
    setAvailableSlots(filteredSlots);
  };

  useEffect(() => {
    filterSlotsByDate(selectedDate);
  }, [selectedDate, rdvList]);

  const handleMotifChange = (motif: string) => {
    setSelectedMotifs((prev) => {
      if (prev.includes(motif)) {
        return prev.filter((m) => m !== motif);
      }
      return [...prev, motif];
    });
  };

  const handleReservation = async () => {
    if (!user || !selectedRdv || selectedMotifs.length === 0) {
      toast({
        title: "Information requise",
        description: "Veuillez sélectionner au moins un motif",
        variant: "destructive",
      });
      return;
    }

    try {
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
    }
  };

  const handleSelectSlot = (rdv: Rdv) => {
    setSelectedRdv(rdv);
    setSelectedMotifs([]);
    setShowConfirmDialog(true);
  };

  const handleCompleteDialogClose = () => {
    setReservationComplete(false);
    setSelectedDate(undefined);
    fetchUserRdv();
  };

  return {
    user,
    loading: loading || isLoading,
    userRdv,
    rdvList,
    selectedDate,
    setSelectedDate,
    availableSlots,
    selectedRdv,
    selectedMotifs,
    showConfirmDialog,
    setShowConfirmDialog,
    reservationComplete,
    setReservationComplete,
    summerRange,
    handleMotifChange,
    handleReservation,
    handleSelectSlot,
    handleCompleteDialogClose
  };
};
