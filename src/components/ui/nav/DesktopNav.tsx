import { Link } from "react-router-dom";
import { Button } from "../button";
import { LogOut } from "lucide-react";
import { NavItem } from "./types";

interface DesktopNavProps {
  menuItems: NavItem[];
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function DesktopNav({ menuItems, isAuthenticated, onLogout }: DesktopNavProps) {
  return (
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
        <Button variant="ghost" onClick={onLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      ) : (
        <Button asChild variant="outline">
          <Link to="/login">Connexion</Link>
        </Button>
      )}
    </div>
  );
}