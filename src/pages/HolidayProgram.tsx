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
  return <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        
      </div>
    </>;
};
export default HolidayProgram;