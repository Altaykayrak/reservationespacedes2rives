import { useRouteError } from "react-router-dom";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-4">Désolé, une erreur est survenue.</p>
        <p className="text-sm text-gray-500 mb-6">{error.message}</p>
        <div className="space-x-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Retour
          </Button>
          <Button
            onClick={() => navigate("/")}
          >
            Accueil
          </Button>
        </div>
      </div>
    </div>
  );
}