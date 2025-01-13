import { useRouteError } from "react-router-dom";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  // Fonction pour obtenir un message d'erreur plus convivial
  const getErrorMessage = () => {
    if (error.message.includes("JWT expired")) {
      return "Votre session a expiré. Veuillez vous reconnecter.";
    }
    if (error.message.includes("No user found")) {
      return "Veuillez vous connecter pour accéder à cette page.";
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