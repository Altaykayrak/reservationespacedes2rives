
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
            variant="glass"
            size="icon"
            className="rounded-full"
          >
            <Menu className="h-5 w-5 text-primary" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="glass-strong border-l border-border/60">
          <div className="flex flex-col gap-2 mt-8">
            {menuItems.map(item => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium px-4 py-3 rounded-xl transition-smooth flex items-center gap-3",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-foreground/80 hover:bg-secondary"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={onLogout}
                className="mt-4 justify-start gap-3 hover:text-destructive hover:border-destructive/40"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            ) : (
              <Button asChild className="mt-4">
                <Link to="/login">Connexion</Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
