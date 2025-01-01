import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mercredis</h2>
          <p className="text-gray-600 mb-4">Gérer les mercredis disponibles et les classes autorisées</p>
          <Button asChild className="w-full">
            <Link to="/admin/wednesdays">Gérer les mercredis</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Vacances</h2>
          <p className="text-gray-600 mb-4">Gérer les périodes de vacances et les classes autorisées</p>
          <Button asChild className="w-full">
            <Link to="/admin/holidays">Gérer les vacances</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Réservations</h2>
          <p className="text-gray-600 mb-4">Voir et gérer toutes les réservations</p>
          <Button asChild className="w-full">
            <Link to="/admin/reservations">Gérer les réservations</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;