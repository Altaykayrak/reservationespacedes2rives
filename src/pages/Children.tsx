// src/pages/Children.tsx
// Redesign complet — logique Supabase identique

import { ChildrenList } from "@/components/profile/ChildrenList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { Users } from "lucide-react";

const Children = () => {
  const navigate = useNavigate();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("profile_id", user.id);

      if (error) {
        console.error("Error fetching children:", error);
        throw error;
      }
      return data as Child[];
    },
  });

  if (error) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto p-4 max-w-lg mt-8">
          <Alert variant="destructive">
            <AlertDescription>
              Une erreur est survenue lors du chargement des données. Veuillez réessayer ou vous reconnecter.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate("/login")}>Se reconnecter</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto p-4 max-w-lg space-y-3 mt-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-sand animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream font-sans">
      <Navbar />

      <div className="container mx-auto px-4 pb-12 max-w-lg">
        {/* Page header */}
        <div className="flex items-center gap-3 mt-6 mb-5">
          <span className="w-10 h-10 rounded-xl bg-sage-pale flex items-center justify-center text-sage shrink-0">
            <Users className="h-5 w-5" />
          </span>
          <h1 className="font-display text-2xl font-medium text-charcoal">
            Liste des enfants
          </h1>
        </div>

        {/* Note maternelle */}
        <div className="flex gap-3 items-start bg-accent-light border-l-4 border-accent rounded-r-xl px-4 py-3 mb-5 text-sm text-amber-800 leading-relaxed">
          <span className="shrink-0 mt-0.5">ℹ️</span>
          <span>
            Pour les enfants en petite section, seules les vacances d'été sont réservables en ligne.
          </span>
        </div>

        {/* La liste existante — composant inchangé */}
        <ChildrenList children={children} />
      </div>
    </div>
  );
};

export default Children;
