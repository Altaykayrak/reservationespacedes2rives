
import { Link } from "react-router-dom";
import { Button } from "../button";
import { Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";
import { NavItem } from "./types";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

interface MobileNavProps {
  menuItems: NavItem[];
  isAuthenticated: boolean;
  onLogout: () => void;
}

export function MobileNav({
  menuItems,
  isAuthenticated,
  onLogout
}: MobileNavProps) {
  const location = useLocation();
  
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full shadow-md hover:shadow-lg transition-all border-2 bg-gradient-to-tr from-white to-gray-50"
          >
            <Menu className="h-5 w-5 text-purple-300" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="bg-gradient-to-br from-white to-gray-50 border-l-2 shadow-lg">
          <div className="flex flex-col space-y-4 mt-6">
            {menuItems.map(item => (
              <Link 
                key={item.href} 
                to={item.href} 
                className={cn(
                  "text-base font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-3",
                  "bg-white shadow hover:shadow-md transform hover:-translate-y-0.5",
                  "border border-gray-100 hover:border-gray-200",
                  location.pathname === item.href
                    ? "bg-purple-300 text-purple-900 hover:bg-purple-400 border-purple-300"
                    : "text-gray-700 hover:text-purple-600"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                onClick={onLogout} 
                className="flex items-center gap-3 mt-2 px-4 py-2 h-auto bg-white border border-gray-100 hover:border-red-200 shadow hover:shadow-md transform hover:-translate-y-0.5 text-gray-700 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            ) : (
              <Button 
                asChild 
                variant="default"
                className="bg-purple-300 hover:bg-purple-400 text-purple-900 transform hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg py-2 h-auto"
              >
                <Link to="/login">Connexion</Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
