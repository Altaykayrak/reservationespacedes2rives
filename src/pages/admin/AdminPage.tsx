
import { Outlet } from "react-router-dom";

export function AdminPage() {
  // Suppression de toute vérification d'authentification et redirection

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
