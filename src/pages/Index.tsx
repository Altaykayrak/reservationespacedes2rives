import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            L'espace des deux rives
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plateforme de réservation pour le centre de loisirs
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;