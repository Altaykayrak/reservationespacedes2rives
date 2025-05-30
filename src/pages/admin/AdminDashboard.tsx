import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Palmtree, ClipboardList, Users, Mail, Calculator, Baby } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Paramétrage Mercredi</h2>
            </div>
            <p className="text-gray-600">Gérer les mercredis disponibles et les classes autorisées</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/wednesdays">Gérer les mercredis</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Palmtree className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Paramétrage Vacances</h2>
            </div>
            <p className="text-gray-600">Gérer les périodes de vacances et les classes autorisées</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/holidays">Gérer les vacances</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestion des réservations</h2>
            </div>
            <p className="text-gray-600">Voir et gérer toutes les réservations</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/reservations">Gérer les réservations</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Baby className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestion des enfants</h2>
            </div>
            <p className="text-gray-600">Voir et gérer tous les enfants inscrits</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/children">Gérer les enfants</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
            </div>
            <p className="text-gray-600">Voir et gérer tous les utilisateurs inscrits</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/profiles">Gérer les utilisateurs</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Gestion des emails</h2>
            </div>
            <p className="text-gray-600">Gérer les emails autorisés à s'inscrire</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/authorized-emails">Gérer les emails</Link>
          </Button>
        </Card>

        <Card className="p-6 flex flex-col h-full">
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Places restantes</h2>
            </div>
            <p className="text-gray-600">Consulter les places disponibles par groupe et par jour</p>
          </div>
          <Button asChild className="mt-4">
            <Link to="/admin/available-spots">Voir les places</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
