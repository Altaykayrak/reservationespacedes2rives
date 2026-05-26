// src/pages/WednesdayReservations.tsx
// Redesign — logique identique à l'original

import { WednesdayReservationContent } from "@/components/reservations/WednesdayReservationContent";
import { WednesdayReservationsList } from "@/components/reservations/WednesdayReservationsList";
import { Calendar } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";

const WednesdayReservations = () => {
  const navigate            = useNavigate();
  const { toast }           = useToast();
  const { user, loading }   = useAuth();
  const { wednesdayAccess, loading: accessLoading } = useAccessControl();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !loading) {
          toast({
            title: "Accès non autorisé",
            description: "Veuillez vous connecter pour accéder à cette page",
            variant: "destructive",
          });
          navigate("../login", { relative: "path" });
        }
        setIsInitialized(true);
      } catch {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de votre session",
          variant: "destructive",
        });
        navigate("../login", { relative: "path" });
      }
    };
    initializeAuth();
  }, [navigate, toast, loading]);

  // ── Chargement ─────────────────────────────────────────────────
  if (loading || !isInitialized || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Chargement…</p>
        </div>
      </div>
    );
  }

  // ── Accès désactivé ─────────────────────────────────────────────
  if (!wednesdayAccess) {
    return (
      <div className="min-h-screen bg-cream font-sans">
        <Navbar />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <div className="bg-white rounded-2xl border border-sand-dark p-8 text-center">
            <span className="w-14 h-14 rounded-2xl bg-sage-pale flex items-center justify-center text-sage mx-auto mb-4">
              <Calendar className="h-7 w-7" />
            </span>
            <h1 className="font-display text-xl font-medium text-charcoal mb-2">
              Réservations mercredis
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              La réservation en ligne des mercredis n'est pas disponible pour le moment.
              Nous vous informerons dès qu'elle sera accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Vue principale ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 max-w-4xl">

        {/* En-tête */}
        <div className="mt-6 mb-5 space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0">
              <Calendar className="h-5 w-5" />
            </span>
            <h1 className="font-display text-2xl font-medium text-charcoal">
              Réservations mercredis
            </h1>
          </div>
          <p className="text-muted-foreground text-sm pl-1">
            Réservez les mercredis pour vos enfants.
          </p>
        </div>

        {/* Bannière info */}
        <div className="flex gap-3 items-start bg-sage-pale border border-sage-mid rounded-2xl px-4 py-3 mb-5 text-sm text-sage leading-relaxed">
          <Calendar className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            Vous pouvez sélectionner plusieurs mercredis à la fois pour créer vos réservations.
            Pour vos enfants en petite section, nous vous invitons à contacter l'accueil.
          </span>
        </div>

        {/* Formulaire de réservation */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark p-5 mb-5">
          <WednesdayReservationContent />
        </div>

        {/* Liste des réservations existantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-sand-dark overflow-hidden">
          <div className="p-5">
            <WednesdayReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WednesdayReservations;
