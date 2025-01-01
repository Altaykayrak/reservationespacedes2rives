import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/EditProfileForm";
import { ChildrenList } from "@/components/profile/ChildrenList";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, Child } from "@/types/profile";

const Profile = () => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data as ProfileData;
    },
  });

  const { data: children = [] } = useQuery({
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
  });

  if (!profile) {
    return <div>Loading...</div>;
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