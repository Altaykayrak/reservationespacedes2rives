import { useRouteError } from "react-router-dom";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface RouterError {
  message?: string;
  statusText?: string;
  data?: any;
}

export default function ErrorBoundary() {
  const error = useRouteError() as RouterError;
  const navigate = useNavigate();

  // Fonction pour obtenir un message d'erreur plus convivial
  const getErrorMessage = () => {
    const errorMessage = error?.message || error?.statusText || "Une erreur est survenue";
    
    if (errorMessage.includes("JWT expired")) {
      return "Votre session a expiré. Veuillez vous reconnecter.";
    }
    if (errorMessage.includes("No user found")) {
      return "Veuillez vous connecter pour accéder à cette page.";
    }
    if (errorMessage.includes("No routes matched location")) {
      return "Cette page n'existe pas.";
    }
    return "Désolé, une erreur est survenue. Veuillez réessayer.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-4">{getErrorMessage()}</p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Retour
          </Button>
          <Button
            onClick={() => navigate("/login")}
          >
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );
}