
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AdminNavbar() {
  const { signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Réservations", href: "/admin/reservations" },
    { label: "Rendez-vous", href: "/admin/rdv" },
    { label: "Utilisateurs", href: "/admin/profiles" },
    { label: "Enfants", href: "/admin/children" },
    { label: "Emails autorisés", href: "/admin/authorized-emails" },
    { label: "Mercredis", href: "/admin/wednesdays" },
    { label: "Périodes vacances", href: "/admin/holidays" },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        
        <nav className="flex-1">
          <ul className="flex space-x-4 overflow-x-auto">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.href
                      ? "bg-indigo-600 text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <Button variant="destructive" onClick={signOut} className="ml-4">
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
