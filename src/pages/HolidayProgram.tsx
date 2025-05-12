
import { Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { EmptyHolidayState } from "@/components/reservations/holiday/EmptyHolidayState";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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

        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertTitle className="text-lg font-semibold text-blue-800">
            Programmes à venir
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Les programmes seront disponibles quelques semaines avant les vacances. 
            Nous vous avertirons par email dès leur publication.
          </AlertDescription>
        </Alert>

        <EmptyHolidayState 
          message="Aucun programme disponible pour le moment"
          subtitle="Les programmes d'activités pour les prochaines vacances seront publiés prochainement. 
                    Merci de votre patience."
          icon="info"
        />
      </div>
    </>
  );
};

export default HolidayProgram;
