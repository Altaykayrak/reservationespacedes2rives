
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { Logo } from "./Logo";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { NavItem } from "./types";

export function Navigation() {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useAdminAuth();
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/admin-login';

  // Ne pas afficher la navigation sur les pages d'authentification
  if (isAuthPage) {
    return null;
  }

  const userMenuItems: NavItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Programmes vacances", href: "/holiday-program" },
    { label: "Tarifs", href: "/prices" },
    { label: "Règlement", href: "/terms-of-operation" },
  ];

  // Ajouter les pages qui nécessitent une authentification si l'utilisateur est connecté
  const authenticatedUserMenuItems: NavItem[] = user ? [
    ...userMenuItems,
    { label: "Profil", href: "/profile" },
    { label: "Enfants", href: "/children" },
    { label: "Réservations Mercredi", href: "/wednesday-reservations" },
    { label: "Réservations Vacances", href: "/holiday-reservations" },
    { label: "Rendez-vous", href: "/rdv" },
  ] : userMenuItems;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4 sm:px-8">
        <Logo />
        <div className="flex-1" />
        <DesktopNav 
          menuItems={authenticatedUserMenuItems} 
          isAuthenticated={!!user} 
          onLogout={signOut} 
        />
        <MobileNav 
          menuItems={authenticatedUserMenuItems} 
          isAuthenticated={!!user} 
          onLogout={signOut} 
        />
      </div>
    </header>
  );
}
