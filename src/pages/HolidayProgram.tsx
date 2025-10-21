import { Baby, User, Users } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
            <CardContent>
              <p className="text-muted-foreground">
                Programme à venir...
              </p>
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
            <CardContent>
              <p className="text-muted-foreground">
                Programme à venir...
              </p>
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
            <CardContent>
              <p className="text-muted-foreground">
                Programme à venir...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default HolidayProgram;