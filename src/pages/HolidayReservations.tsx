
import { useAuth } from "@/hooks/useAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { useToast } from "@/hooks/use-toast";
import { injectAnimationStyles } from "@/lib/utils";

const HolidayReservations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Injecter les styles d'animation pour améliorer l'interaction
    injectAnimationStyles();
    
    const checkAccess = async () => {
      if (!user?.id) return;

      // Récupérer les états directement de la base de données
      const { data, error } = await supabase
        .from('profiles')
        .select('is_waiting, is_closed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking access:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification de l'accès",
          variant: "destructive"
        });
        return;
      }

      console.log('Profile data:', data);
      setIsWaiting(data?.is_waiting || false);
      setIsClosed(data?.is_closed || false);
    };

    checkAccess();
  }, [user, toast]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations Vacances
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez les périodes de vacances pour vos enfants de maternelle et primaire.
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
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <HolidayReservationContent invertSelectors={true} filterTeenPeriods={false} />
          </div>
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
