
import { useAuth } from "@/hooks/useAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { toast, customToast } from "@/hooks/use-toast";

const HolidayReservations = () => {
  const { user } = useAuth();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const { holidayPeriods, isLoading: periodsLoading, error: periodsError } = useHolidayPeriods();
  const profileCheckCompleted = useRef(false);
  const profileCheckInProgress = useRef(false);

  // Réduire les logs pour éviter de surcharger la console
  useEffect(() => {
    // N'afficher le log que lors du premier rendu et lorsqu'il y a des changements significatifs
    console.log("[HolidayReservations] Rendering with:", {
      isWaiting,
      isClosed,
      isProfileLoaded,
      periodsLoading,
      periodsError: !!periodsError,
      holidayPeriodsCount: holidayPeriods?.length || 0
    });
  }, [isWaiting, isClosed, isProfileLoaded, periodsLoading, periodsError, holidayPeriods?.length]);

  useEffect(() => {
    // Éviter les vérifications multiples en établissant deux conditions de garde
    if (!user?.id || profileCheckCompleted.current || profileCheckInProgress.current) return;

    const checkAccess = async () => {
      try {
        // Éviter les appels multiples en plaçant un verrou
        profileCheckInProgress.current = true;
        
        // Récupérer les états directement de la base de données
        const { data, error } = await supabase
          .from('profiles')
          .select('is_waiting, is_closed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[HolidayReservations] Erreur lors de la vérification de l\'accès:', error);
          customToast.error("Erreur lors de la vérification de l'accès");
          return;
        }

        console.log('[HolidayReservations] Données du profil:', data);
        setIsWaiting(data?.is_waiting || false);
        setIsClosed(data?.is_closed || false);
        setIsProfileLoaded(true);
        
        // Marquer la vérification comme terminée
        profileCheckCompleted.current = true;
      } catch (err) {
        console.error('[HolidayReservations] Exception:', err);
        setIsProfileLoaded(true); // Marquer comme chargé pour que l'UI puisse procéder
        profileCheckCompleted.current = true;
      } finally {
        // Relâcher le verrou dans tous les cas
        profileCheckInProgress.current = false;
      }
    };

    checkAccess();
  }, [user]);

  // Vérifier si des périodes sont disponibles
  const hasAvailablePeriods = holidayPeriods && holidayPeriods.length > 0;

  // Bloquer le rendu tant que les données essentielles ne sont pas chargées
  const isLoadingEssentialData = !isProfileLoaded || periodsLoading;
  
  // Afficher le chargement pendant la vérification
  if (isLoadingEssentialData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Afficher une erreur si la récupération des périodes a échoué
  if (periodsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Erreur de chargement" 
            subtitle="Impossible de récupérer les périodes de vacances. Veuillez réessayer plus tard."
            icon="info"
          />
        </div>
      </div>
    );
  }

  // Afficher le message d'attente et empêcher la création de nouvelles réservations
  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Réservations bientôt disponibles !" 
            subtitle="Les inscriptions ne sont pas encore ouvertes. Vous serez informé(e) par e-mail dès leur lancement. Restez à l'affût ! ✉️📅"
            icon="info"
          />
        </div>
      </div>
    );
  }

  // Afficher le message lorsqu'il n'y a plus de périodes disponibles
  if (!hasAvailablePeriods && !periodsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Aucune période de vacances disponible" 
            subtitle="Il n'y a actuellement aucune période de vacances disponible pour les réservations."
            icon="calendar"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations vacances
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez des places pour vos enfants pour les vacances.
          </p>
        </div>

        {isClosed ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <EmptyHolidayState 
              message="Réservations clôturées !" 
              subtitle="Les inscriptions sont désormais fermées. Vous serez informé(e) par e-mail dès l'ouverture des inscriptions pour les prochaines vacances. À bientôt ! ✉️📅"
              icon="info"
            />
          </div>
        ) : (
          <HolidayReservationContent 
            initialPeriodId={holidayPeriods?.[0]?.id} 
            key={`holiday-content-${profileCheckCompleted.current ? 'loaded' : 'loading'}`}
          />
        )}

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <HolidayReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayReservations;
