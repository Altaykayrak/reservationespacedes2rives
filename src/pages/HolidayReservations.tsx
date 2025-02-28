
import { useAuth } from "@/hooks/useAuth";
import { HolidayReservationContent } from "@/components/reservations/HolidayReservationContent";
import { HolidayReservationsList } from "@/components/reservations/HolidayReservationsList";
import { CalendarDays } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";

const HolidayReservations = () => {
  const { user } = useAuth();
  const [isWaiting, setIsWaiting] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_waiting, is_closed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking access:', error);
        return;
      }

      setIsWaiting(data.is_waiting);
      setIsClosed(data.is_closed);
    };

    checkAccess();
  }, [user]);

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Accès non disponible" 
            subtitle="Les réservations n'ont pas encore commencé."
            icon="info"
          />
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="container mx-auto p-4 md:p-6">
          <EmptyHolidayState 
            message="Accès non disponible" 
            subtitle="Les réservations sont closes."
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
              Réservations vacances
            </h1>
          </div>
          <p className="text-muted-foreground text-base md:text-lg">
            Réservez des places pour vos enfants pour les vacances.
          </p>
        </div>

        <HolidayReservationContent />

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
