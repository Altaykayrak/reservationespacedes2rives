// src/pages/TeenHolidayReservations.tsx
// Redesign — logique identique à l'original

import { useAuth } from "@/hooks/useAuth";
import { TeenHolidayReservationContent } from "@/components/reservations/TeenHolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { PersonStanding } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TeenHolidayReservations = () => {
  const { user, loading, initialized, session } = useAuth();
  const navigate = useNavigate();
  const [isWaiting, setIsWaiting]       = useState(false);
  const [isClosed, setIsClosed]         = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_waiting, is_closed")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          setProfileError(`Erreur d'accès au profil: ${error.message}`);
          toast.error("Erreur lors de la vérification du profil utilisateur");
          return;
        }
        if (!data) { setProfileError("Profil utilisateur non trouvé"); return; }
        setIsWaiting(data.is_waiting || false);
        setIsClosed(data.is_closed   || false);
        setProfileError(null);
      } catch (error: any) {
        setProfileError(`Erreur inattendue: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialized && !loading) checkAccess();
  }, [user, loading, initialized, session]);

  if (initialized && !loading && !user) {
    return (
      <Shell>
        <Card>
          <EmptyHolidayState message="Connexion requise" subtitle="Vous devez être connecté pour accéder aux réservations du Club Ado." icon="info">
            <Button onClick={() => navigate("/login")} className="mt-4">Se connecter</Button>
          </EmptyHolidayState>
        </Card>
      </Shell>
    );
  }

  if (loading || isLoading) {
    return (
      <Shell>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </Shell>
    );
  }

  if (profileError) {
    return (
      <Shell>
        <Card>
          <EmptyHolidayState message="Erreur de chargement" subtitle={profileError} icon="error" />
        </Card>
      </Shell>
    );
  }

  if (isWaiting) {
    return (
      <Shell>
        <Card>
          <EmptyHolidayState
            message="Réservations bientôt disponibles !"
            subtitle="Les inscriptions ne sont pas encore ouvertes. Vous serez informé(e) par e-mail dès leur lancement. ✉️📅"
            icon="info"
          />
        </Card>
      </Shell>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        <div className="mt-6 mb-5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
              <PersonStanding className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-medium text-charcoal">Réservations Club Ado</h1>
          </div>
          <p className="text-muted-foreground text-sm pl-1">
            Réservez les périodes de vacances pour vos adolescents.
          </p>
          <p className="text-sm font-semibold text-destructive pl-1">
            Sélectionner au moins 3 jours par semaine. En cas de journée complète, merci de contacter l'accueil pour une inscription sur liste d'attente.
          </p>
        </div>

        {isClosed ? (
          <Card>
            <EmptyHolidayState
              message="Réservations clôturées !"
              subtitle="Les inscriptions sont désormais fermées. Vous serez informé(e) par e-mail dès leur lancement. ✉️📅"
              icon="info"
            />
          </Card>
        ) : (
          <Card className="mb-5">
            <TeenHolidayReservationContent />
          </Card>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
          <div className="p-5">
            <HolidayReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 max-w-4xl mt-6 space-y-4">{children}</div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-sand-dark p-5 ${className}`}>
      {children}
    </div>
  );
}

export default TeenHolidayReservations;
