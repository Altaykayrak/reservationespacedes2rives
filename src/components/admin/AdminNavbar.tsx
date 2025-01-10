import { Link, useLocation } from "react-router-dom";

export const AdminNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-secondary mb-8">
      <nav className="container mx-auto px-4">
        <ul className="flex space-x-4 overflow-x-auto py-4">
          <li>
            <Link
              to="/admin"
              className={`whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                isActive("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link
              to="/admin/wednesdays"
              className={`whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                isActive("/admin/wednesdays")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Mercredis
            </Link>
          </li>
          <li>
            <Link
              to="/admin/holidays"
              className={`whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                isActive("/admin/holidays")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Vacances
            </Link>
          </li>
          <li>
            <Link
              to="/admin/reservations"
              className={`whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                isActive("/admin/reservations")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary-foreground/10"
              }`}
            >
              Réservations
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};