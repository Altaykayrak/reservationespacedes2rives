import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User, Mail, MapPin, CheckSquare } from "lucide-react"
import { ProfileData } from "@/types/profile"

interface ProfileSectionProps {
  profile: ProfileData
  onEdit: () => void
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mon Profil</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEdit}
        >
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start space-x-4">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Prénom</p>
              <p className="text-lg font-medium">{profile?.first_name || '-'}</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Nom</p>
              <p className="text-lg font-medium">{profile?.last_name || '-'}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Mail className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-medium">{profile?.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
            <div className="text-left">
              <p className="text-sm text-muted-foreground">Commune de scolarisation</p>
              <p className="text-lg font-medium">{profile?.school_city || '-'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-4 pt-4 border-t">
          <CheckSquare className="h-5 w-5 text-muted-foreground mt-1" />
          <div className="text-left">
            <p className="text-sm text-muted-foreground">Prélèvement automatique</p>
            <p className="text-lg font-medium">
              {profile?.automatic_payment ? 'Activé' : 'Désactivé'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}