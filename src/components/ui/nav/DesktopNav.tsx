
import { Link } from "react-router-dom";
import { Button } from "../button";
import { LogOut } from "lucide-react";
import { NavItem } from "./types";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface DesktopNavProps {
  menuItems: NavItem[];
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function DesktopNav({ menuItems, isAuthenticated, onLogout }: DesktopNavProps) {
  const location = useLocation();
  // Filter out the Wednesday reservations menu item if needed
  const filteredMenuItems = menuItems.filter(item => item.label !== "Réservations mercredi");

  return (
    <div className="hidden md:flex items-center gap-2">
      {filteredMenuItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "px-3 py-2 rounded-md text-sm font-medium transition-all",
            "hover:shadow transform hover:-translate-y-0.5",
            location.pathname === item.href
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-700 hover:text-indigo-600 hover:bg-white hover:bg-opacity-90"
          )}
        >
          {item.label}
        </Link>
      ))}
      {isAuthenticated ? (
        <Button 
          variant="ghost" 
          onClick={onLogout} 
          className="flex items-center gap-2 ml-2 text-gray-700 hover:text-red-600 hover:bg-white hover:bg-opacity-80 hover:shadow transform hover:-translate-y-0.5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      ) : (
        <Button asChild variant="default" className="ml-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
          <Link to="/login">Connexion</Link>
        </Button>
      )}
    </div>
  );
}
