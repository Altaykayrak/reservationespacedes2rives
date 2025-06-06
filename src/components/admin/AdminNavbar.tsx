
import { Button } from "@/components/ui/button";
import { Users, Calendar, UserCheck, Mail, CalendarDays, Palmtree, MessageCircle, Baby, Calculator, Menu } from "lucide-react";
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
    }
  ];

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Administration</h1>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={location.pathname === item.href ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.href)}
                className={location.pathname === item.href 
                  ? "flex items-center gap-2 bg-purple-200 hover:bg-purple-300 text-purple-800"
                  : "flex items-center gap-2 hover:bg-purple-100 hover:text-purple-700"
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Button>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden hover:bg-purple-100">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col gap-4 py-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant={location.pathname === item.href ? "default" : "ghost"}
                    onClick={() => navigate(item.href)}
                    className={location.pathname === item.href 
                      ? "justify-start gap-2 bg-purple-200 hover:bg-purple-300 text-purple-800"
                      : "justify-start gap-2 hover:bg-purple-100 hover:text-purple-700"
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleSignOut}
            className="bg-red-200 hover:bg-red-300 text-red-800 border-red-300"
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
};
