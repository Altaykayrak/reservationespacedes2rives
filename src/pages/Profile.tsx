import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/EditProfileForm";
import { ChildrenList } from "@/components/profile/ChildrenList";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, Child } from "@/types/profile";

const Profile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

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
        
      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      return {
        ...data,
        email: user.email,
      } as ProfileData;
    },
  });

  const { data: children = [], isLoading: childrenLoading } = useQuery({
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
    enabled: !!profile, // Only fetch children if profile exists
  });

  if (profileError) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">
          Une erreur est survenue lors du chargement du profil. Veuillez réessayer.
        </div>
      </div>
    );
  }

  if (profileLoading || childrenLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          Profil non trouvé. Veuillez vous reconnecter.
          <div className="mt-4">
            <Button onClick={() => navigate("/login")}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button asChild className="flex-1">
          <Link to="/reservations">Réservations Mercredi</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link to="/holiday-reservations">Réservations Vacances</Link>
        </Button>
      </div>

      <div className="grid gap-8">
        <ProfileSection 
          profile={profile} 
          onEdit={() => setShowEditDialog(true)} 
        />

        <ChildrenList children={children} />
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
          </DialogHeader>
          <EditProfileForm 
            initialData={profile} 
            onSuccess={() => setShowEditDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;