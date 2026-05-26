// src/pages/Index.tsx — Redesign page d'accueil

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { Calendar, Users, ImageIcon, UmbrellaIcon, CalendarDays, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div
        className="relative text-white overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.18), rgba(0,0,0,0.18)),
            url('https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images//Newfront.jpg')`,
          backgroundPosition: "15% top",
          backgroundSize: "cover",
          height: "560px",
        }}
      >
        <div className="container mx-auto px-4 flex flex-col items-center pt-10">
          <img
            src="https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Logolong.png"
            alt="L'espace des deux rives"
            className="h-24 mx-auto"
          />
        </div>

        {/* Boutons en bas du hero */}
        <div className="absolute bottom-10 left-0 right-0 flex flex-col sm:flex-row justify-center gap-3 px-4">
          <Button
            asChild
            size="lg"
            className="bg-sage hover:bg-sage-light text-white rounded-xl px-8 font-medium shadow-lg"
          >
            <Link to="/login">Connexion</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-white/15 border-white/40 text-white hover:bg-white/25 rounded-xl px-8 font-medium backdrop-blur-sm"
          >
            <Link to="/register">Inscription</Link>
          </Button>
        </div>
      </div>

      {/* ── Accroche ─────────────────────────────────────── */}
      <div className="bg-white py-8 px-4 text-center border-b border-sand-dark">
        <p className="max-w-2xl mx-auto text-muted-foreground text-base leading-relaxed">
          Bienvenue sur la plateforme de réservation du centre social de Pîtres et du Manoir-Sur-Seine,
          votre partenaire de confiance pour l'épanouissement de vos enfants.
        </p>
      </div>

      {/* ── Services ─────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h2 className="font-display text-2xl font-medium text-center text-charcoal mb-8">
          Nos services
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <ServiceCard
            icon={Calendar}
            color="sage"
            title="Activités variées"
            desc="Un programme riche en activités éducatives, sportives et créatives pour les mercredis et les vacances scolaires."
          />
          <ServiceCard
            icon={Users}
            color="accent"
            title="Équipe qualifiée"
            desc="Une équipe d'animateurs professionnels et passionnés pour accompagner vos enfants dans leur développement."
          />
          <ServiceCard
            icon={ImageIcon}
            color="indigo"
            title="Cadre exceptionnel"
            desc="Un environnement sécurisé avec des espaces intérieurs et extérieurs propices à l'épanouissement."
          />
        </div>
      </div>

      {/* ── Liens rapides ─────────────────────────────────── */}
      <div className="bg-sand-dark/40 py-10 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="font-display text-xl font-medium text-center text-charcoal mb-6">
            Accès rapide
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickAccess to="/holiday-program" icon={FileText} label="Programme" />
            <QuickAccess to="/prices" icon={CalendarDays} label="Tarifs" />
            <QuickAccess to="/rdv" icon={UmbrellaIcon} label="RDV" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-charcoal text-white/60 py-6 px-4 text-center text-xs">
        <p>© {new Date().getFullYear()} Espace des 2 rives · 4 place de la Fraternité, 27590 Pîtres</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/terms-of-service" className="hover:text-white transition-colors">CGU</Link>
          <Link to="/terms-of-operation" className="hover:text-white transition-colors">Règlement</Link>
        </div>
      </footer>
    </div>
  );
};

type Color = "sage" | "accent" | "indigo";
const colorMap: Record<Color, { bg: string; icon: string }> = {
  sage:   { bg: "bg-sage-pale",  icon: "text-sage" },
  accent: { bg: "bg-accent-light", icon: "text-accent" },
  indigo: { bg: "bg-indigo-50",  icon: "text-indigo-500" },
};

function ServiceCard({
  icon: Icon, color, title, desc,
}: { icon: React.ElementType; color: Color; title: string; desc: string }) {
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl border border-sand-dark p-5 flex flex-col gap-4">
      <span className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
        <Icon className={`h-5 w-5 ${c.icon}`} />
      </span>
      <div>
        <h3 className="font-medium text-charcoal text-base mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function QuickAccess({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-sand-dark p-4 flex flex-col items-center gap-2 hover:border-sage-mid hover:bg-sage-pale/30 transition-all group text-center"
    >
      <span className="w-10 h-10 rounded-xl bg-sage-pale flex items-center justify-center text-sage">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-medium text-charcoal">{label}</span>
    </Link>
  );
}

export default Index;
