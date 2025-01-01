import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { Calendar, Users, MapPin } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gray-500 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-8">
            <svg
              className="w-24 h-24 mx-auto mb-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11m16-11v11M8 21V10m8 11V10" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-6">L'espace des deux rives</h1>
          <p className="text-xl mb-12 max-w-3xl mx-auto">
            Bienvenue au centre de loisirs d'Amfreville-sous-les-Monts, votre
            partenaire de confiance pour l'épanouissement de vos enfants
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100">
              <Link to="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Activités variées */}
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-6 text-indigo-600" />
              <h2 className="text-2xl font-bold mb-4">Activités variées</h2>
              <p className="text-gray-600">
                Un programme riche en activités éducatives, sportives et créatives pour
                les mercredis et les vacances scolaires.
              </p>
            </div>

            {/* Équipe qualifiée */}
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-6 text-indigo-600" />
              <h2 className="text-2xl font-bold mb-4">Équipe qualifiée</h2>
              <p className="text-gray-600">
                Une équipe d'animateurs professionnels et passionnés pour
                accompagner vos enfants dans leur développement.
              </p>
            </div>

            {/* Cadre exceptionnel */}
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-6 text-indigo-600" />
              <h2 className="text-2xl font-bold mb-4">Cadre exceptionnel</h2>
              <p className="text-gray-600">
                Un environnement chaleureux et accueillant au cœur de notre belle
                commune, propice à l'apprentissage et à la découverte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;