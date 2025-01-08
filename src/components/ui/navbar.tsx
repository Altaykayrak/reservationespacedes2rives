import { Link } from "react-router-dom";
import { Button } from "./button";
import { Users, Calendar, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center">
          <img
            src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Logolong.png"
            alt="L'espace des deux rives"
            className="h-12"
          />
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/children" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Enfants
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/reservations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Réservations
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </Link>
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </nav>
  );
};