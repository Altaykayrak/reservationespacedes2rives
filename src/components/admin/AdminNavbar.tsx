
import { Button } from "@/components/ui/button";
import { Users, Calendar, UserCheck, Mail, CalendarDays, Palmtree, MessageCircle, Baby, Calculator, Menu, ListOrdered } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
      icon: Baby,
      description: "Gestion des enfants"
    },
    {
      title: "Mercredis",
      href: "/admin/wednesdayreservations",
      icon: Calendar,
      description: "Réservations mercredis"
    },
    {
      title: "Vacances",
      href: "/admin/holidayreservations",
      icon: CalendarDays,
      description: "Réservations vacances"
    },
    {
      title: "Config Mercredis",
      href: "/admin/wednesdays",
      icon: CalendarDays,
      description: "Gestion des mercredis"
    },
    {
      title: "Config Vacances",
      href: "/admin/holidays",
      icon: Palmtree,
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
      title: "Places mercredis",
      href: "/admin/spots/wednesday",
      icon: Calculator,
      description: "Places disponibles mercredis"
    },
    {
      title: "Places vacances",
      href: "/admin/spots/holiday",
      icon: Calculator,
      description: "Places disponibles vacances"
    },
    {
      title: "Liste d'attente",
      href: "/admin/listeattente",
      icon: ListOrdered,
      description: "Gérer la liste d'attente"
    }
  ];

  return (
    <div className="sticky top-0 z-50 px-3 pt-3">
      <div className="glass shadow-soft rounded-2xl flex h-14 items-center px-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center text-primary-foreground text-sm font-bold">
            A
          </div>
          <h1 className="text-base font-semibold tracking-tight">Administration</h1>
        </div>

        <div className="ml-auto flex items-center space-x-2">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={
                  location.pathname === item.href
                    ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-primary text-primary-foreground shadow-glow transition-smooth"
                    : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-secondary/60 transition-smooth"
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.title}
              </button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="glass" size="icon" className="lg:hidden rounded-full">
                <Menu className="h-5 w-5 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 glass-strong border-l border-border/60">
              <div className="flex flex-col gap-4 py-4">
                <h2 className="text-lg font-semibold tracking-tight">Navigation</h2>
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className={
                      location.pathname === item.href
                        ? "flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow transition-smooth text-left"
                        : "flex items-center gap-3 px-3 py-2.5 rounded-xl text-foreground/80 hover:bg-secondary transition-smooth text-left"
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="hover:text-destructive hover:border-destructive/40"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
};
