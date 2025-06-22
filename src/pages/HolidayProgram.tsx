
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
import { ImageViewer } from "@/components/ui/image-viewer";
import { ZoomIn, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const HolidayProgram = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
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
      src: "/lovable-uploads/6d971c85-81f5-46df-8edf-6a1b046bcbac.png",
      alt: "Animations 10-14 ans - Espace des 2 rives"
    },
    {
      src: "/lovable-uploads/24d1b2eb-a1a1-4880-9f79-4fa085f2f546.png",
      alt: "Programme 10-14 ans - Planning des activités"
    },
    {
      src: "/lovable-uploads/adbaec1d-1391-47c1-b0c5-4a573afd78b6.png",
      alt: "Programme Club ados - Informations générales"
    }
  ];

  const elementaryImages = [
    {
      src: "/lovable-uploads/b38ffe6e-5ae5-4549-a248-fddb4e115c5d.png",
      alt: "Programme élémentaire - Planning des activités GS à CM1"
    },
    {
      src: "/lovable-uploads/88af44d6-07a0-44d5-bc09-88a9550e6cb1.png",
      alt: "Animations élémentaire - Informations pratiques 5-9 ans"
    }
  ];

  const handleImageClick = (image: { src: string; alt: string }) => {
    setSelectedImage(image);
  };

  const handleDownload = (src: string, alt: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt.replace(/\s+/g, '_') + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
                <Carousel className="w-full">
                  <CarouselContent>
                    {elementaryImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="relative group">
                          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                              onClick={() => handleImageClick(image)}
                            />
                          </AspectRatio>
                          
                          {/* Overlay avec boutons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(image);
                              }}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image.src, image.alt);
                              }}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">Programme d'activités pour les enfants d'école primaire</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez sur une image pour zoomer ou télécharger</p>
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
                        <div className="relative group">
                          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="w-full h-full object-cover cursor-pointer transition-transform duration-200 group-hover:scale-105"
                              onClick={() => handleImageClick(image)}
                            />
                          </AspectRatio>
                          
                          {/* Overlay avec boutons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(image);
                              }}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image.src, image.alt);
                              }}
                              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              </div>
              <div className="text-center text-gray-600">
                <p className="text-sm">Programme d'activités pour les adolescents</p>
                <p className="text-xs text-gray-500 mt-1">Cliquez sur une image pour zoomer ou télécharger</p>
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

        {/* Image Viewer Modal */}
        {selectedImage && (
          <ImageViewer
            src={selectedImage.src}
            alt={selectedImage.alt}
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
      </div>
    </>
  );
};

export default HolidayProgram;
