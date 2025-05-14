
import { Button } from "./button";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4">Page non trouvée</h2>
        <p className="mt-2 text-lg text-gray-600">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Retourner à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
}
