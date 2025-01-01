import { Button } from "@/components/ui/button";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AddChildForm } from "@/components/profile/AddChildForm";
import { ChildrenList } from "@/components/profile/ChildrenList";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { Link } from "react-router-dom";

const Profile = () => {
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
        <ProfileSection title="Mon Profil">
          <EditProfileForm />
        </ProfileSection>

        <ProfileSection title="Mes Enfants">
          <div className="space-y-8">
            <ChildrenList />
            <AddChildForm />
          </div>
        </ProfileSection>
      </div>
    </div>
  );
};

export default Profile;