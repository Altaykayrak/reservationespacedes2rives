
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

  return (
    <div className="hidden md:flex items-center gap-2">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
            "hover:shadow transform hover:-translate-y-0.5",
            location.pathname === item.href
              ? "bg-purple-300 text-purple-900 shadow-md"
              : "text-gray-700 hover:text-purple-600 hover:bg-white hover:bg-opacity-90"
          )}
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          {item.label}
        </Link>
      ))}
      {isAuthenticated ? (
        <Button 
          variant="ghost" 
          onClick={onLogout} 
          className="flex items-center gap-2 ml-2 py-1.5 h-auto text-gray-700 hover:text-red-600 hover:bg-white hover:bg-opacity-80 hover:shadow transform hover:-translate-y-0.5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      ) : (
        <Button asChild variant="default" className="ml-2 bg-purple-300 hover:bg-purple-400 text-purple-900 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all py-1.5 h-auto">
          <Link to="/login">Connexion</Link>
        </Button>
      )}
    </div>
  );
}
