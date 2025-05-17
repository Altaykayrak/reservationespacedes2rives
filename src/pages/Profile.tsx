
import { Button } from "@/components/ui/button";
import { ChildrenList } from "@/components/profile/ChildrenList";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, Child } from "@/types/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/components/ui/navbar";

const Profile = () => {
  // Suppression de la redirection automatique ici

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      if (!data) {
        console.error("Profile not found");
        throw new Error("Profile not found");
      }

      return {
        ...data,
        email: user.email,
      } as ProfileData;
    },
  });

  const { data: children = [], isLoading: childrenLoading, error: childrenError } = useQuery({
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
    enabled: !!profile, // Only fetch children if profile exists
  });

  if (profileError || childrenError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>
            Une erreur est survenue lors du chargement des données. Veuillez réessayer.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link to="/login">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (profileLoading || childrenLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>
            Profil non trouvé. Veuillez vous connecter.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link to="/login">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button asChild variant="default" className="flex-1">
            <Link to="/holiday-reservations">Réservations Vacances</Link>
          </Button>
          <Button asChild variant="default" className="flex-1">
            <Link to="/teenholiday-reservations">Réservations Club Ado</Link>
          </Button>
        </div>

        <div className="grid gap-8">
          <ProfileSection profile={profile} />
          <ChildrenList children={children} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
