
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, CheckSquare, Square } from "lucide-react"
import { ProfileData } from "@/types/profile"

interface ProfileSectionProps {
  profile: ProfileData
  onEdit: () => void
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon Profil</CardTitle>
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
        </div>

        <div className="flex items-start space-x-4 pt-4 border-t">
          <div className="flex items-center">
            {profile?.automatic_payment ? (
              <CheckSquare className="h-5 w-5 text-primary mt-1" />
            ) : (
              <Square className="h-5 w-5 text-muted-foreground mt-1" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">
              Prélèvement automatique 
              <span className="text-xs block text-muted-foreground italic mt-1">
                (Pour activer ou désactiver le prélèvement automatique de vos factures, merci de contacter l'accueil.)
              </span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
