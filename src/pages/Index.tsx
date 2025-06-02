
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { Calendar, Users, Image } from "lucide-react";

const Index = () => {
  return <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
 <div className="relative bg-cover text-white py-12 overflow-hidden" style={{
  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), url('https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Newfront.jpg')`,
  backgroundPosition:  "30% top",
  height: "580px"  // hauteur à ajuster précisément
}}>

        <div className="container mx-auto px-4 text-center">
          <div className="mt-0">
            <img src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Logolong.png" alt="L'espace des deux rives" className="h-24 mx-auto" />
          </div>
          <h1 className="text-5xl font-bold mb-6"></h1>
          <p className="text-xl mb-12 max-w-3xl mx-auto text-red-300">
          </p>
          <div className="mt-[320px] flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">
              <Link to="/login">Connexion</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white text-indigo-600 hover:bg-gray-100 w-full sm:w-auto">
              <Link to="/register">Inscription</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="max-w-4xl mx-auto text-base text-center text-gray-600">
            Bienvenue sur la plateforme de réservation du centre social de Pîtres et du Manoir-Sur-Seine, votre partenaire de confiance pour l'épanouissement de vos enfants.
          </p>
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
              <Image className="w-12 h-12 mx-auto mb-6 text-indigo-600" />
              <h2 className="text-2xl font-bold mb-4">Cadre exceptionnel</h2>
              <p className="text-gray-600">
                Un environnement sécurisé et adapté, avec des espaces intérieurs et
                extérieurs propices à l'épanouissement des enfants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;
