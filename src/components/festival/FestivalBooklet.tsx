import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageViewer } from "@/components/ui/image-viewer";

interface FestivalBookletProps {
  pages: string[];
}

export const FestivalBooklet = ({ pages }: FestivalBookletProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const goToNextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4">
      {/* Page counter */}
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">
          Page {currentPage + 1} / {pages.length}
        </p>
      </div>

      {/* Book container */}
      <div className="relative w-full aspect-[3/4] max-h-[80vh] perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-600 ${
            isFlipping ? "scale-95" : "scale-100"
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Current page */}
          <div
            className={`absolute inset-0 w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden transition-opacity duration-300 ${
              isFlipping ? "opacity-0" : "opacity-100"
            }`}
          >
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="w-full h-full object-contain cursor-pointer"
              onClick={() => setIsViewerOpen(true)}
            />
            
            {/* Enlarge button overlay */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white shadow-lg"
              onClick={() => setIsViewerOpen(true)}
            >
              <Maximize2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-center gap-4 w-full">
        <Button
          variant="outline"
          size="lg"
          onClick={goToPreviousPage}
          disabled={currentPage === 0 || isFlipping}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="hidden sm:inline">Précédent</span>
        </Button>

        {/* Page dots */}
        <div className="flex gap-2 overflow-x-auto max-w-xs px-2">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isFlipping && index !== currentPage) {
                  setIsFlipping(true);
                  setTimeout(() => {
                    setCurrentPage(index);
                    setIsFlipping(false);
                  }, 600);
                }
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentPage
                  ? "bg-purple-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Aller à la page ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={goToNextPage}
          disabled={currentPage === pages.length - 1 || isFlipping}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Suivant</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Image viewer for full screen */}
      <ImageViewer
        src={pages[currentPage]}
        alt={`Page ${currentPage + 1}`}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
};
