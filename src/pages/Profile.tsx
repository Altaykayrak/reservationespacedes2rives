
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
  console.log("[Profile] Rendering Profile component");

  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("[Profile] Fetching user data");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("[Profile] No user found in getUser()");
        throw new Error("No user found");
      }
      
      console.log("[Profile] User found:", user.email);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
        
      if (error) {
        console.error("[Profile] Error fetching profile:", error);
        throw error;
      }
      
      if (!data) {
        console.error("[Profile] Profile not found for user:", user.id);
        throw new Error("Profile not found");
      }

      console.log("[Profile] Profile data fetched successfully");
      return {
        ...data,
        email: user.email,
      } as ProfileData;
    },
  });

  const { data: children = [], isLoading: childrenLoading, error: childrenError } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      console.log("[Profile] Fetching children data");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("[Profile] No user found when fetching children");
        throw new Error("No user found");
      }
      
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("profile_id", user.id);
        
      if (error) {
        console.error("[Profile] Error fetching children:", error);
        throw error;
      }
      
      console.log("[Profile] Children data fetched successfully, count:", data?.length || 0);
      return data as Child[];
    },
    enabled: !!profile, // Only fetch children if profile exists
  });

  if (profileLoading || childrenLoading) {
    console.log("[Profile] Loading data...");
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (profileError || childrenError) {
    console.error("[Profile] Error in profile or children data:", profileError || childrenError);
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

  if (!profile) {
    console.error("[Profile] No profile data available after loading");
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

  console.log("[Profile] Rendering profile content");
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
