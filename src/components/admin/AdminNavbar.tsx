import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminNavbar() {
  const { signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:w-60">
            <SheetHeader>
              <SheetTitle>Administration</SheetTitle>
              <SheetDescription>
                Gérez les différents aspects de l'application.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block py-2 px-4 rounded hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <SheetFooter>
              <Button variant="destructive" onClick={signOut}>
                Se déconnecter
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="ml-auto font-semibold">Administration</div>
      </div>
    </div>
  );
}

const SheetFooter = ({ children }: { children: React.ReactNode }) => {
  return <div className="mt-6 flex items-center justify-end">{children}</div>;
};
