import { Facebook, Info } from "lucide-react";
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
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 font-semibold">
                Programme disponible
              </AlertTitle>
              <AlertDescription className="text-blue-700 mt-2">
                <p className="mb-3">
                  Le programme des vacances est disponible sur notre page Facebook.
                </p>
                <a
                  href="https://www.facebook.com/p/Espace-des-2-rives-100057280757151/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  <Facebook className="h-5 w-5" />
                  Espace des 2 rives
                </a>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default HolidayProgram;