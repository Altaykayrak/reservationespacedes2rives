import { Link } from "react-router-dom";
import { Button } from "./button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "./sheet";

export function Navbar() {
  const menuItems = [
    { label: "Accueil", href: "/" },
    { label: "Réservations", href: "/reservations" },
    { label: "Mes enfants", href: "/children" },
    { label: "Mon profil", href: "/profile" },
  ];

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            EDR
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
            <Button asChild variant="outline">
              <Link to="/login">Connexion</Link>
            </Button>
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
                  <Button asChild variant="outline">
                    <Link to="/login">Connexion</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}