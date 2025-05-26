
import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { Users, Calendar, UserCheck, Mail, CalendarDays, Plane, MessageCircle, Users2, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/admin-login");
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Users,
      description: "Vue d'ensemble"
    },
    {
      title: "Profils",
      href: "/admin/profiles",
      icon: UserCheck,
      description: "Gestion des profils utilisateurs"
    },
    {
      title: "Enfants",
      href: "/admin/children",
      icon: Users2,
      description: "Gestion des enfants"
    },
    {
      title: "Réservations",
      href: "/admin/reservations",
      icon: Calendar,
      description: "Gestion des réservations"
    },
    {
      title: "Mercredis",
      href: "/admin/wednesdays",
      icon: CalendarDays,
      description: "Gestion des mercredis"
    },
    {
      title: "Vacances",
      href: "/admin/holidays",
      icon: Plane,
      description: "Gestion des périodes de vacances"
    },
    {
      title: "Rendez-vous",
      href: "/admin/rdv",
      icon: MessageCircle,
      description: "Gestion des rendez-vous"
    },
    {
      title: "Emails autorisés",
      href: "/admin/authorized-emails",
      icon: Mail,
      description: "Gestion des emails autorisés"
    },
    {
      title: "Places restantes",
      href: "/admin/available-spots",
      icon: MapPin,
      description: "Consultation des places disponibles"
    }
  ];

  return (
    <Navbar
      title="Administration"
      navItems={navItems}
      currentPath={location.pathname}
      onNavigate={navigate}
      onSignOut={handleSignOut}
      showSignOut={true}
    />
  );
};
