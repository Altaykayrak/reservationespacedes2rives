
import { Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

  const teenImages = [
    {
      src: "/lovable-uploads/b6dd29e9-3775-4d44-a30f-37b6be91ad65.png",
      alt: "Programme Adolescents - Espace des 2 rives"
    },
    // Add the other uploaded images here when they are available
    // You can replace these placeholder URLs with the actual uploaded image paths
    {
      src: "/lovable-uploads/b6dd29e9-3775-4d44-a30f-37b6be91ad65.png",
      alt: "Activités adolescents - Image 2"
    },
    {
      src: "/lovable-uploads/b6dd29e9-3775-4d44-a30f-37b6be91ad65.png", 
      alt: "Activités adolescents - Image 3"
    }
  ];
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <Info className={`h-6 w-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Bloc Maternelle */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl text-blue-700 text-center">
                Maternelle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">📷</div>
                    <p className="text-sm">Image à venir</p>
                  </div>
                </AspectRatio>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">Programme spécialement conçu pour les plus petits</p>
              </div>
            </CardContent>
          </Card>

          {/* Bloc Élémentaire */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-xl text-green-700 text-center">
                Élémentaire
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <AspectRatio ratio={16 / 9} className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">📷</div>
                    <p className="text-sm">Image à venir</p>
                  </div>
                </AspectRatio>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">Activités adaptées aux enfants d'école primaire</p>
              </div>
            </CardContent>
          </Card>

          {/* Bloc Ado */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-xl text-purple-700 text-center">
                Adolescents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Carousel className="w-full">
                  <CarouselContent>
                    {teenImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">Programme d'activités pour les adolescents</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Les programmes détaillés seront disponibles quelques semaines avant les vacances. 
            Nous vous informerons par email dès leur mise en ligne.
          </p>
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;
