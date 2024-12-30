import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Mon Profil</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-xl text-gray-600 mb-8">
              Bienvenue sur votre espace personnel
            </p>
            <Button asChild variant="outline">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;