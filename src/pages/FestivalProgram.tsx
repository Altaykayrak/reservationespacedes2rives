import { Navbar } from "@/components/ui/navbar";
import { FestivalBooklet } from "@/components/festival/FestivalBooklet";
import { Music } from "lucide-react";

const FestivalProgram = () => {
  // All festival program pages in order
  const festivalPages = [
    "/lovable-uploads/festival_page_1.jpg",
    "/lovable-uploads/festival_page_3.jpg",
    "/lovable-uploads/festival_page_4.jpg",
    "/lovable-uploads/festival_page_5.jpg",
    "/lovable-uploads/festival_page_6.jpg",
    "/lovable-uploads/festival_page_7.jpg",
    "/lovable-uploads/festival_page_8.jpg",
    "/lovable-uploads/festival_page_9.jpg",
    "/lovable-uploads/festival_page_10.jpg",
    "/lovable-uploads/festival_page_11.jpg",
    "/lovable-uploads/festival_page_12.jpg",
    "/lovable-uploads/festival_page_13.jpg",
    "/lovable-uploads/festival_page_14.jpg",
    "/lovable-uploads/festival_page_15.jpg",
    "/lovable-uploads/festival_page_16.jpg",
    "/lovable-uploads/festival_page_17.jpg",
    "/lovable-uploads/festival_page_18.jpg",
    "/lovable-uploads/festival_page_19.jpg",
    "/lovable-uploads/festival_page_20.jpg",
    "/lovable-uploads/festival_page_21.jpg",
    "/lovable-uploads/festival_page_22.jpg",
    "/lovable-uploads/festival_page_23.jpg",
    "/lovable-uploads/festival_page_24.jpg",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Programme Festival
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Découvrez le programme complet de notre festival - Tournez les pages avec les flèches
          </p>
        </div>

        <FestivalBooklet pages={festivalPages} />
      </div>
    </div>
  );
};

export default FestivalProgram;
