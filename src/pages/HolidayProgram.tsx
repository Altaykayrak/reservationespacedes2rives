import { Info } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ImageViewer } from "@/components/ui/image-viewer";
import { ZoomIn, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
const HolidayProgram = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
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
  const teenImages = [{
    src: "/lovable-uploads/6d971c85-81f5-46df-8edf-6a1b046bcbac.png",
    alt: "Animations 10-14 ans - Espace des 2 rives"
  }, {
    src: "/lovable-uploads/24d1b2eb-a1a1-4880-9f79-4fa085f2f546.png",
    alt: "Programme 10-14 ans - Planning des activités"
  }, {
    src: "/lovable-uploads/adbaec1d-1391-47c1-b0c5-4a573afd78b6.png",
    alt: "Programme Club ados - Informations générales"
  }];
  const elementaryImages = [{
    src: "/lovable-uploads/88af44d6-07a0-44d5-bc09-88a9550e6cb1.png",
    alt: "Animations élémentaire - Informations pratiques 5-9 ans"
  }, {
    src: "/lovable-uploads/b38ffe6e-5ae5-4549-a248-fddb4e115c5d.png",
    alt: "Programme élémentaire - Planning des activités GS à CM1"
  }];
  const maternelleImages = [{
    src: "/lovable-uploads/4dba25e8-238b-4dfe-8889-14f692f41ccb.png",
    alt: "Thème Cowboy et Indien - 01"
  }, {
    src: "/lovable-uploads/1980a964-3b22-499d-8467-889484e044ef.png",
    alt: "Thème Afrique - 02"
  }, {
    src: "/lovable-uploads/2e25a357-6dda-4586-aa5a-8bc21c87836d.png",
    alt: "Thème Viking - 03"
  }, {
    src: "/lovable-uploads/796c4fb4-2fb1-4a6a-b066-96c95484b1d2.png",
    alt: "Thème Cowboy et Indien - 04"
  }];

  const newProgramImages = [{
    src: "/lovable-uploads/7bb68464-92b1-41e0-a6a6-2091013dcf01.png",
    alt: "Programme Animations 4-10 ans - Horaires et informations générales"
  }, {
    src: "/lovable-uploads/a9d1f41d-ba23-4cd6-837f-9fd36fe28ace.png",
    alt: "Programme détaillé maternels et élémentaires - Activités par semaine"
  }];
  const handleImageClick = (image: {
    src: string;
    alt: string;
  }) => {
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
  return <>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-8">
          <Info className={`h-6 w-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />
          <h1 className="text-3xl font-bold">Programme Vacances</h1>
        </div>

        {/* Programme Général 4-10 ans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-primary">
              Programme Général 4-10 ans - Août 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newProgramImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <AspectRatio ratio={4/3}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-contain rounded-lg border shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => handleImageClick(image)}
                    />
                  </AspectRatio>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick(image);
                      }}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image.src, image.alt);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-gray-600">
          Cliquez sur les images pour les agrandir ou les télécharger
        </div>

        {/* Image Viewer Modal */}
        {selectedImage && <ImageViewer src={selectedImage.src} alt={selectedImage.alt} isOpen={!!selectedImage} onClose={() => setSelectedImage(null)} />}
      </div>
    </>;
};
export default HolidayProgram;