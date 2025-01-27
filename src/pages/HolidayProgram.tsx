import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Child, User, Users } from "lucide-react";

const HolidayProgram = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-8">
        <BookOpen className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Programme Vacances</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Child className="h-5 w-5 text-blue-500" />
              <CardTitle>Programme Maternelles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Activités sensorielles et créatives</li>
              <li>Jeux de motricité</li>
              <li>Temps calmes et sieste</li>
              <li>Activités d'éveil musical</li>
              <li>Jeux collectifs adaptés</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              <CardTitle>Programme Primaires</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Activités sportives</li>
              <li>Ateliers créatifs</li>
              <li>Jeux de société</li>
              <li>Activités nature et découverte</li>
              <li>Projets collectifs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              <CardTitle>Programme Ados</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Activités sportives</li>
              <li>Sorties culturelles</li>
              <li>Ateliers créatifs</li>
              <li>Projets en groupe</li>
              <li>Activités multimédia</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HolidayProgram;