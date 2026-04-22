
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
    <div className="hidden md:flex items-center gap-1">
      {menuItems.map((item) => {
        const active = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "px-3.5 py-2 rounded-xl text-sm font-medium transition-smooth flex items-center gap-2",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
          </Link>
        );
      })}
      {isAuthenticated ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="ml-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      ) : (
        <Button asChild size="sm" className="ml-2">
          <Link to="/login">Connexion</Link>
        </Button>
      )}
    </div>
  );
}
