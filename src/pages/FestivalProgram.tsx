import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableImage } from "@/components/holiday/ClickableImage";
import { Music } from "lucide-react";

const FestivalProgram = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Programme Festival
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Découvrez le programme complet de notre festival
        </p>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-purple-600" />
              <CardTitle>Programme du Festival</CardTitle>
            </div>
            <CardDescription>
              Toutes les animations et activités prévues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Les images seront ajoutées ici */}
              <p className="text-center text-gray-500 py-8">
                Images à ajouter...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FestivalProgram;
