// src/components/ui/navbar.tsx
// Remplace l'ancien navbar — même interface, nouveau design

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Menu, X, LogOut, User, Users, Calendar, CalendarDays,
  UmbrellaIcon, PersonStanding, FileText, DollarSign, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/profile",                   label: "Mon profil",          icon: User },
  { to: "/children",                  label: "Mes enfants",         icon: Users },
  { to: "/wednesday-reservations",    label: "Mercredis",           icon: Calendar },
  { to: "/holiday-reservations",      label: "Vacances",            icon: UmbrellaIcon },
  { to: "/teenholiday-reservations",  label: "Club Ado",            icon: PersonStanding },
  { to: "/rdv",                       label: "Rendez-vous",         icon: CalendarDays },
  { to: "/holiday-program",           label: "Programme",           icon: FileText },
  { to: "/prices",                    label: "Tarifs",              icon: DollarSign },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate   = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/login");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sand-dark">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-display text-lg font-medium text-sage">
            Accueil<span className="text-accent">Loisirs</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === to
                    ? "bg-sage-pale text-sage"
                    : "text-warm-gray hover:bg-sand hover:text-charcoal"
                )}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-warm-gray hover:bg-sand hover:text-charcoal transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden w-9 h-9 rounded-full border border-sage-mid bg-white flex items-center justify-center text-sage transition-colors hover:bg-sage-pale"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <nav className="absolute top-0 right-0 h-full w-72 bg-cream shadow-xl flex flex-col pt-16 pb-6 px-4 animate-fadeUp">
            <p className="text-xs font-medium tracking-widest text-muted uppercase px-2 mb-3">
              Navigation
            </p>

            <div className="flex flex-col gap-1 flex-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === to
                      ? "bg-sage text-white"
                      : "text-charcoal hover:bg-sage-pale hover:text-sage"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                    pathname === to ? "bg-white/20" : "bg-sand"
                  )}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </Link>
              ))}
            </div>

            <button
              onClick={() => { setOpen(false); handleLogout(); }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-4 border border-destructive/20"
            >
              <span className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </span>
              Se déconnecter
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
