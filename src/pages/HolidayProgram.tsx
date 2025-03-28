
import { BookOpen, Calendar, Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">Programme Primaire</h2>
              <div className="relative aspect-auto">
                <img 
                  src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Prgprimpaques.jpg" 
                  alt="Programme de vacances primaire" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4">Programme Adolescents</h2>
              <div className="relative aspect-auto">
                <img 
                  src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Prgadopaques.png" 
                  alt="Programme de vacances adolescents" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
