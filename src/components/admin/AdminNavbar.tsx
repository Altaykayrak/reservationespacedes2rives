
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNav } from "@/components/ui/nav/MobileNav";
import { Logo } from "@/components/ui/nav/Logo";
import { useAuth } from "@/hooks/useAuth";

export const AdminNavbar = () => {
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

  const links = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/wednesdays", label: "Mercredis" },
    { href: "/admin/holidays", label: "Vacances" },
    { href: "/admin/reservations", label: "Réservations" },
    { href: "/admin/profiles", label: "Utilisateurs" },
    { href: "/admin/authorized-emails", label: "Emails autorisés" },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="bg-gray-100 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Logo />
        {isMobile ? (
          <div className="flex justify-start">
            <MobileNav 
              menuItems={links}
              isAuthenticated={true}
              onLogout={handleLogout}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 mx-auto">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors",
                    location.pathname === link.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-gray-200"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="ml-4"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};
