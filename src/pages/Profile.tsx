// src/pages/Profile.tsx
// Redesign complet — même logique Supabase/React Query, nouveau design

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, Child } from "@/types/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ChildrenList } from "@/components/profile/ChildrenList";
import {
  UmbrellaIcon, PersonStanding, Calendar, CalendarDays,
  User, Mail, CreditCard, ChevronRight,
} from "lucide-react";

const Profile = () => {
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return { ...data, email: user.email } as ProfileData;
    },
  });

  const {
    data: children = [],
    isLoading: childrenLoading,
    error: childrenError,
  } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("profile_id", user.id);

      if (error) throw error;
      return data as Child[];
    },
    enabled: !!profile,
  });

  // ── États d'erreur ──────────────────────────────────────────────
  if (profileError || childrenError) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto p-4 max-w-lg">
          <Alert variant="destructive" className="mt-8">
            <AlertDescription>
              Une erreur est survenue lors du chargement des données. Veuillez réessayer.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Chargement ─────────────────────────────────────────────────
  if (profileLoading || childrenLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto p-4 max-w-lg space-y-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-sand animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto p-4 max-w-lg mt-8">
          <Alert>
            <AlertDescription>
              Profil non trouvé. Veuillez vous connecter.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Initiales pour l'avatar
  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pb-12 max-w-lg">

        {/* ── Hero / avatar ─────────────────────────────── */}
        <div className="mt-5 mb-5 bg-sage rounded-2xl px-6 py-7 flex items-center gap-5 relative overflow-hidden">
          {/* déco cercles */}
          <span className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/[.07]" />
          <span className="absolute -bottom-5 right-10 w-20 h-20 rounded-full bg-white/[.05]" />

          <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/30 flex items-center justify-center font-display text-2xl text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-display text-xl text-white font-medium leading-tight">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-sm text-white/70 mt-0.5">{profile.email}</p>
          </div>
        </div>

        {/* ── Raccourcis ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <QuickLink to="/holiday-reservations" icon={UmbrellaIcon} color="sage" label="Vacances" />
          <QuickLink to="/wednesday-reservations" icon={Calendar} color="accent" label="Mercredis" />
          <QuickLink to="/teenholiday-reservations" icon={PersonStanding} color="indigo" label="Club Ado" />
          <QuickLink to="/rdv" icon={CalendarDays} color="amber" label="RDV" />
        </div>

        {/* ── Infos profil ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-sand-dark mb-5 overflow-hidden">
          <InfoRow icon={User} label="Prénom" value={profile.first_name ?? "—"} />
          <InfoRow icon={User} label="Nom" value={profile.last_name ?? "—"} />
          <InfoRow icon={Mail} label="Email" value={profile.email ?? "—"} />
          <div className="flex items-center gap-4 px-5 py-4">
            <IconBox icon={CreditCard} />
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Prélèvement automatique
              </p>
              <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                Pour modifier, contactez l'accueil.
              </p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              profile.automatic_payment
                ? "bg-sage-pale text-sage"
                : "bg-sand text-muted-foreground"
            }`}>
              {profile.automatic_payment ? "Activé" : "Inactif"}
            </span>
          </div>
        </div>

        {/* ── Enfants ───────────────────────────────────── */}
        <ChildrenList children={children} />
      </div>
    </div>
  );
};

// ── Sous-composants ────────────────────────────────────────────────

type Color = "sage" | "accent" | "indigo" | "amber";

const colorMap: Record<Color, { bg: string; icon: string }> = {
  sage:   { bg: "bg-sage-pale",    icon: "text-sage" },
  accent: { bg: "bg-accent-light", icon: "text-accent" },
  indigo: { bg: "bg-indigo-50",    icon: "text-indigo-500" },
  amber:  { bg: "bg-amber-50",     icon: "text-amber-600" },
};

function QuickLink({
  to, icon: Icon, color, label,
}: { to: string; icon: React.ElementType; color: Color; label: string }) {
  const c = colorMap[color];
  return (
    <Link
      to={to}
      className="bg-white border border-sand-dark rounded-2xl p-4 flex flex-col gap-3 hover:border-sage-mid hover:bg-sage-pale/30 transition-all group"
    >
      <span className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${c.icon}`} />
      </span>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-charcoal">{label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-sage transition-colors" />
      </div>
    </Link>
  );
}

function IconBox({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <span className="w-9 h-9 rounded-xl bg-sage-pale flex items-center justify-center text-sage shrink-0">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function InfoRow({
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-sand last:border-b-0">
      <IconBox icon={Icon} />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-charcoal mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default Profile;
