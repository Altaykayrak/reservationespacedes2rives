
import { BookOpen, Calendar, Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect } from "react";

const HolidayProgram = () => {
  const [isVisible, setIsVisible] = useState(true);

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
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        <div className="p-8 border rounded-lg bg-blue-50 shadow-sm">
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-3 bg-blue-100 rounded-full transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-30'}`}>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Le programme sera disponible dans quelques semaines.
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Vous serez notifiée de sa mise en ligne par e-mail et via notre page Facebook.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
