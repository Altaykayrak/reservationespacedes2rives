
import { WednesdayReservationContent } from "@/components/reservations/WednesdayReservationContent";
import { WednesdayReservationsList } from "@/components/reservations/WednesdayReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAccessControl } from "@/hooks/useAccessControl";
import { supabase } from "@/integrations/supabase/client";

const WednesdayReservations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { wednesdayAccess, loading: accessLoading } = useAccessControl();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && !loading) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Accès non autorisé",
            description: "Veuillez vous connecter pour accéder à cette page",
            variant: "destructive",
          });
          navigate("../login", { relative: "path" });
        }
        setIsInitialized(true);
      } catch (error) {
        console.error("Error checking session:", error);
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

  if (loading || !isInitialized || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!wednesdayAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Accès non disponible</h1>
            <p className="text-gray-600">
              Les réservations mercredis ne sont pas disponibles pour votre compte.
            </p>
          </div>
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
              Réservations mercredis
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez les mercredis pour vos enfants.
          </p>
        </div>

        <WednesdayReservationContent />

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-4 md:p-6">
            <WednesdayReservationsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WednesdayReservations;
