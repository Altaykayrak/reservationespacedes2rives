import { useAuth } from "@/hooks/useAuth";
import { useHolidayReservation } from "@/hooks/useHolidayReservation";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { toast } from "sonner";
import { injectAnimationStyles } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HolidayReservations = () => {
  const { selectedPeriod } = useHolidayReservation();
  const { user, loading, initialized, session } = useAuth();
  const navigate = useNavigate();

  const [isWaiting, setIsWaiting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    injectAnimationStyles();
    const blinkTimer = setTimeout(() => setIsBlinking(false), 6000);

    const checkAccess = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("is_waiting, is_closed")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setProfileError(`Erreur d'accès au profil : ${error.message}`);
        toast.error("Erreur lors de la vérification du profil utilisateur");
      } else if (!data) {
        setProfileError("Profil utilisateur non trouvé");
      } else {
        setIsWaiting(data.is_waiting);
        setIsClosed(data.is_closed);
        setProfileError(null);
      }
      setIsLoading(false);
    };

    if (initialized && !loading) checkAccess();
    return () => clearTimeout(blinkTimer);
  }, [user, loading, initialized, session, toast]);

  if (initialized && !loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState
            message="Connexion requise"
            subtitle="Vous devez être connecté pour accéder aux réservations de vacances."
            icon="info"
          >
            <Button onClick={() => navigate("/login")} className="mt-4">
              Se connecter
            </Button>
          </EmptyHolidayState>
        </div>
      </div>
    );
  }

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

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState
            message="Réservations bientôt disponibles !"
            subtitle="Les inscriptions ne sont pas encore ouvertes. Vous serez informé(e) par e-mail dès leur lancement."
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
            Réservez les périodes de vacances pour vos enfants de maternelle et
            primaire.
          </p>
          <p
            className={`text-red-600 font-bold text-sm md:text-base ${
              isBlinking ? "animate-blink" : ""
            }`}
          >
            Sélectionner au moins 3 jours par semaine. Pour les enfants en CM2,
            les réservations d’août se font ici, en juillet rendez-vous dans
            « Club Ado ». En cas de journée complète, contactez l’accueil.
          </p>
        </div>

        {isClosed ? (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <EmptyHolidayState
              message="Réservations clôturées !"
              subtitle="Les inscriptions sont désormais fermées."
              icon="info"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
            <HolidayReservationContent
              invertSelectors={true}
              filterTeenPeriods={false}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <HolidayReservationsList periodId={selectedPeriod!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayReservations;
