
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
import { Skeleton } from "@/components/ui/skeleton";

const HolidayReservations = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    // Injecter les styles d'animation pour améliorer l'interaction
    injectAnimationStyles();
    
    const checkAccess = async () => {
      if (!user?.id) {
        console.log("Aucun utilisateur trouvé, attente de l'authentification...");
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);

      try {
        console.log("Tentative de récupération du profil pour l'utilisateur:", user.id);
        
        // Récupérer les états directement de la base de données avec gestion d'erreurs améliorée
        const { data, error } = await supabase
          .from('profiles')
          .select('is_waiting, is_closed')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          setProfileError(`Erreur d'accès au profil: ${error.message}`);
          toast({
            title: "Erreur",
            description: "Erreur lors de la vérification du profil utilisateur",
            variant: "destructive"
          });
          return;
        }

        if (!data) {
          console.warn('Profil non trouvé pour cet utilisateur');
          setProfileError("Profil utilisateur non trouvé");
          return;
        }

        console.log('Données du profil récupérées:', data);
        setIsWaiting(data.is_waiting || false);
        setIsClosed(data.is_closed || false);
        setProfileError(null);
      } catch (error: any) {
        console.error("Erreur inattendue lors de la récupération des données:", error);
        setProfileError(`Erreur inattendue: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, toast]);

  // Affiche un squelette de chargement pendant l'initialisation de l'auth ou le chargement du profil
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-10 w-64" />
            </div>
            <Skeleton className="h-6 w-96" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Afficher une erreur si le profil n'a pas pu être récupéré
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Erreur lors du chargement du profil" 
            subtitle={profileError}
            icon="error"
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
