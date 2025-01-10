import { Link, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { Menu, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./sheet";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier l'état d'authentification initial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const authenticatedMenuItems = [
    { label: "Accueil", href: "/" },
    { label: "Réservations", href: "/reservations" },
    { label: "Mes enfants", href: "/children" },
    { label: "Mon profil", href: "/profile" },
  ];

  const publicMenuItems = [
    { label: "Accueil", href: "/" },
  ];

  const menuItems = isAuthenticated ? authenticatedMenuItems : publicMenuItems;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Logolong.png"
              alt="L'espace des deux rives"
              className="h-12"
            />
          </Link>

          {/* Menu pour desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-gray-600 hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/login">Connexion</Link>
              </Button>
            )}
          </div>

          {/* Menu hamburger pour mobile */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {isAuthenticated ? (
                    <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link to="/login">Connexion</Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}