
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./nav/Logo";
import { DesktopNav } from "./nav/DesktopNav";
import { MobileNav } from "./nav/MobileNav";
import { NavItem } from "./nav/types";

export function Navbar() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const authenticatedMenuItems: NavItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Mon profil", href: "/profile" },
    { label: "Mes enfants", href: "/children" },
    // Removed "Réservations mercredis" item
    { label: "Réservations vacances", href: "/holiday-reservations" },
    { label: "Réservations Club Ado", href: "/teenholiday-reservations" },
    { label: "Programme vacances", href: "/holiday-program" },
    { label: "Règlement de fonctionnement", href: "/terms-of-operation" },
    { label: "CGU", href: "/terms-of-service" },
    { label: "Simulateur de tarifs", href: "/prices" },
  ];

  const publicMenuItems: NavItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Programme vacances", href: "/holiday-program" },
    { label: "Règlement de fonctionnement", href: "/terms-of-operation" },
    { label: "CGU", href: "/terms-of-service" },
    { label: "Simulateur de tarifs", href: "/prices" },
  ];

  const menuItems = isAuthenticated ? authenticatedMenuItems : publicMenuItems;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          <DesktopNav 
            menuItems={menuItems}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
          <MobileNav 
            menuItems={menuItems}
            isAuthenticated={isAuthenticated}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
}
