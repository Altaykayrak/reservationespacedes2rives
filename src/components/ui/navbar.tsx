
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Home, CalendarDays, User, BookUser } from "lucide-react";

export function Navbar() {
  const { globalSettings, loading: gLoad } = useGlobalSettings();
  const { userSettings, loading: uLoad } = useUserSettings();
  const { user, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const loading = gLoad || uLoad;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const hideWed =
    globalSettings.hide_wednesday_reservations ||
    userSettings.hide_wednesday_reservations;
  const hideRdv = 
    globalSettings.hide_rdv_page || 
    userSettings.hide_rdv_page;

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const navItems = [
    { label: "Accueil", href: "/", icon: Home },
    { label: "Vacances", href: "/holiday-reservations", icon: CalendarDays },
    ...(hideWed ? [] : [{ label: "Mercredis", href: "/wednesday-reservations", icon: CalendarDays }]),
    ...(hideRdv ? [] : [{ label: "Rendez-vous", href: "/rdv", icon: BookUser }]),
    { label: "Mon Profil", href: "/profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link className="flex items-center space-x-2 font-bold text-xl text-primary" to="/">
            <span>MonEspace</span>
          </Link>
        </div>
        
        <nav className="flex flex-1 items-center justify-center md:justify-start space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        
        {user && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Déconnexion</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
