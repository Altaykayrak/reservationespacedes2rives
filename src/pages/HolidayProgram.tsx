import { Construction, Mail } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <Alert className="border-amber-200 bg-amber-50">
              <Construction className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-800 font-semibold">
                Programmes en cours de réalisation
              </AlertTitle>
              <AlertDescription className="text-amber-700 mt-2">
                <p className="mb-3">
                  Les programmes des vacances sont actuellement en cours de préparation par notre équipe.
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>
                    Vous serez avertis par e-mail dès leur mise à disposition.
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HolidayProgram;