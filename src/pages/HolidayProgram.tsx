
import { Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { useIsMobile } from "@/hooks/use-mobile";

const HolidayProgram = () => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();

  // Effet de clignotement de l'icône au chargement
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 700);

    // Arrêter l'effet après 3 secondes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsVisible(true);
    }, 3000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <Info className={`h-6 w-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        <EmptyHolidayState 
          message="Programmes à venir"
          subtitle="Les programmes d'activités pour les prochaines vacances seront disponibles quelques semaines avant les dates prévues. Nous vous informerons par email dès leur mise en ligne. Merci de votre patience."
          icon="info"
          className="bg-blue-50 border-blue-200"
        />
      </div>
    </>
  );
};

export default HolidayProgram;
