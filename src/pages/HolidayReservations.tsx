// src/pages/HolidayReservations.tsx
// Redesign complet — toute la logique métier (useAuth, is_waiting, is_closed) inchangée

import { useAuth } from "@/hooks/useAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { UmbrellaIcon } from "lucide-react";
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
  const { user, loading, initialized, session } = useAuth();
  const navigate = useNavigate();
  const [isWaiting, setIsWaiting]       = useState(false);
  const [isClosed, setIsClosed]         = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isBlinking, setIsBlinking]     = useState(true);

  useEffect(() => {
    injectAnimationStyles();

    const blinkTimer = setTimeout(() => setIsBlinking(false), 6000);

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
    return () => clearTimeout(blinkTimer);
  }, [user, loading, initialized, session]);

  // ── Guards ──────────────────────────────────────────────────────

  if (initialized && !loading && !user) {
    return (
      <PageShell>
        <StateCard>
          <EmptyHolidayState
            message="Connexion requise"
            subtitle="Vous devez être connecté pour accéder aux réservations de vacances."
            icon="info"
          >
            <Button onClick={() => navigate("/login")} className="mt-4">
              Se connecter
            </Button>
          </EmptyHolidayState>
        </StateCard>
      </PageShell>
    );
  }

  if (loading || isLoading) {
    return (
      <PageShell>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </PageShell>
    );
  }

  if (profileError) {
    return (
      <PageShell>
        <StateCard>
          <EmptyHolidayState message="Erreur de chargement" subtitle={profileError} icon="error" />
        </StateCard>
      </PageShell>
    );
  }

  if (isWaiting) {
    return (
      <PageShell>
        <StateCard>
          <EmptyHolidayState
            message="Réservations bientôt disponibles !"
            subtitle="Les inscriptions ne sont pas encore ouvertes. Vous serez informé(e) par e-mail dès leur lancement. ✉️📅"
            icon="info"
          />
        </StateCard>
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        {/* ── En-tête ────────────────────────────────────── */}
        <div className="mt-6 mb-5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-sage-pale flex items-center justify-center text-sage shrink-0">
              <UmbrellaIcon className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-medium text-charcoal">
              Réservations Vacances
            </h1>
          </div>
          <p className="text-muted-foreground text-sm pl-1">
            Réservez les périodes de vacances pour vos enfants de maternelle et primaire.
          </p>
          <p className={`text-sm font-semibold text-destructive pl-1 ${isBlinking ? "animate-blink" : ""}`}>
            Sélectionner au moins 3 jours par semaine. En cas de journée complète, merci de contacter l'accueil pour une inscription sur liste d'attente.
          </p>
        </div>

        {/* ── Contenu principal ──────────────────────────── */}
        {isClosed ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6">
            <EmptyHolidayState
              message="Réservations clôturées !"
              subtitle="Les inscriptions sont désormais fermées. Vous serez informé(e) par e-mail dès l'ouverture des prochaines vacances. ✉️📅"
              icon="info"
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5 mb-5">
            <HolidayReservationContent invertSelectors={true} filterTeenPeriods={false} />
          </div>
        )}

        {/* ── Liste réservations existantes ─────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
          <div className="p-5">
            <HolidayReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Layout helpers ────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 max-w-4xl mt-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

function StateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-6">
      {children}
    </div>
  );
}

export default HolidayReservations;
