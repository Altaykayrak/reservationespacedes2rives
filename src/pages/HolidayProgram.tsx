import { Baby, User, Users } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableImage } from "@/components/holiday/ClickableImage";

const HolidayProgram = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Programme des Vacances</h1>
          <p className="text-muted-foreground text-lg">
            Découvrez les activités prévues pour chaque groupe d'âge
          </p>
        </div>

        <div className="space-y-6">
          {/* Bloc Maternel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-6 w-6 text-blue-500" />
                Maternel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Vacances de la Toussaint - 1ère semaine</h3>
                <ClickableImage 
                  src="/lovable-uploads/maternels_1ere_semaine.jpeg" 
                  alt="Programme maternels - Vacances de la Toussaint du 20 au 24 octobre"
                  className="max-w-md rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Semaine d&apos;Halloween - 2ème semaine</h3>
                <ClickableImage 
                  src="/lovable-uploads/maternels_2eme_semaine.jpeg" 
                  alt="Programme maternels - Semaine d'Halloween du 27 au 31 octobre"
                  className="max-w-md rounded-lg shadow-md"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bloc Élémentaire */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-green-500" />
                Élémentaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-semibold text-lg">Vacances du 20 au 31 octobre 2025 - CP à CM2</h3>
              <ClickableImage 
                src="/lovable-uploads/elementaire_vacances.jpg" 
                alt="Programme élémentaire - Animations pour les CP à CM2 du 20 au 31 octobre"
                className="max-w-md rounded-lg shadow-md"
              />
            </CardContent>
          </Card>

          {/* Bloc Ado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-500" />
                Ado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Club Ados - Du 20 au 31 octobre 2025</h3>
                <ClickableImage 
                  src="/lovable-uploads/ados_1.jpg" 
                  alt="Club Ados - Animations pour les collégiens du 20 au 31 octobre"
                  className="max-w-md rounded-lg shadow-md"
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Programme détaillé</h3>
                <ClickableImage 
                  src="/lovable-uploads/ados_2.jpg" 
                  alt="Programme détaillé Club Ados"
                  className="max-w-md rounded-lg shadow-md"
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