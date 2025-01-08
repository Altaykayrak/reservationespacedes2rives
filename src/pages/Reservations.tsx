import { ReservationCalendar } from "@/components/reservations/ReservationCalendar";
import { ReservationForm } from "@/components/reservations/ReservationForm";
import { ReservationsList } from "@/components/reservations/ReservationsList";
import { useReservations } from "@/hooks/useReservations";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Home, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Reservations = () => {
  const navigate = useNavigate();
  const {
    selectedDates,
    setSelectedDates,
    selectedChild,
    setSelectedChild,
    children,
    reservations,
    handleSubmit,
    isSubmitting
  } = useReservations();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Button variant="ghost" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Réservations
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gérez vos réservations pour les mercredis et consultez l'historique de vos réservations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Sélection des dates</h2>
                <ReservationCalendar
                  selectedDates={selectedDates.map(d => d.date)}
                  setSelectedDates={dates => setSelectedDates(dates.map(date => ({
                    date,
                    withoutMeal: false,
                    earlyDropoff: false,
                  })))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">Détails de la réservation</h2>
                <ReservationForm
                  selectedDates={selectedDates.map(d => d.date)}
                  children={children}
                  selectedChild={selectedChild}
                  setSelectedChild={setSelectedChild}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  setSelectedDates={setSelectedDates}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="p-6">
            <ReservationsList reservations={reservations} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;