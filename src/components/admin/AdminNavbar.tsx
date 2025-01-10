import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const AdminNavbar = () => {
  const location = useLocation();

  const links = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/wednesdays", label: "Mercredis" },
    { href: "/admin/holidays", label: "Vacances" },
    { href: "/admin/reservations", label: "Réservations" },
    { href: "/admin/authorized-emails", label: "Emails autorisés" },
  ];

  return (
    <nav className="bg-gray-100 p-4">
      <div className="container mx-auto flex flex-wrap gap-4">
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
    </nav>
  );
};