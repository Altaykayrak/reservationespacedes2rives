
import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent,
  DialogClose
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

const HolidayProgram = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [openImagePrimary, setOpenImagePrimary] = useState(false);
  const [openImageTeen, setOpenImageTeen] = useState(false);
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
  
  // Lors de l'ouverture d'une image, forcer le mode paysage si on est sur mobile
  useEffect(() => {
    // Vérifier si le navigateur supporte l'API d'orientation d'écran
    if (isMobile && (openImagePrimary || openImageTeen) && window.screen.orientation) {
      try {
        // Demander le mode paysage
        window.screen.orientation.lock('landscape').catch(err => {
          console.log("Orientation lock not supported:", err);
        });
      } catch (error) {
        console.log("Screen orientation API not supported");
      }

      return () => {
        // Libérer le verrouillage d'orientation lorsque le dialogue est fermé
        if (window.screen.orientation) {
          try {
            window.screen.orientation.unlock();
          } catch (error) {
            console.log("Error unlocking orientation:", error);
          }
        }
      };
    }
  }, [openImagePrimary, openImageTeen, isMobile]);
  
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
                  className={`w-full h-auto rounded-lg shadow-md ${isMobile ? "cursor-pointer" : ""}`}
                  onClick={() => isMobile && setOpenImagePrimary(true)}
                />
                {isMobile && <div className="absolute bottom-2 right-2 bg-white/70 text-xs font-medium py-1 px-2 rounded-full">
                  Toucher pour agrandir
                </div>}
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
                  className={`w-full h-auto rounded-lg shadow-md ${isMobile ? "cursor-pointer" : ""}`}
                  onClick={() => isMobile && setOpenImageTeen(true)}
                />
                {isMobile && <div className="absolute bottom-2 right-2 bg-white/70 text-xs font-medium py-1 px-2 rounded-full">
                  Toucher pour agrandir
                </div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dialogues pour l'affichage en plein écran sur mobile */}
        <Dialog open={openImagePrimary} onOpenChange={setOpenImagePrimary}>
          <DialogContent className="sm:max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Prgprimpaques.jpg" 
                alt="Programme de vacances primaire" 
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              <DialogClose className="absolute top-2 right-2 rounded-full h-8 w-8 bg-white/50 flex items-center justify-center">
                ✕
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={openImageTeen} onOpenChange={setOpenImageTeen}>
          <DialogContent className="sm:max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Prgadopaques.png" 
                alt="Programme de vacances adolescents" 
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
              <DialogClose className="absolute top-2 right-2 rounded-full h-8 w-8 bg-white/50 flex items-center justify-center">
                ✕
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default HolidayProgram;
