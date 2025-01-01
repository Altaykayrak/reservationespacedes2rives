import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { ProfileData } from "@/types/profile"

interface ProfileSectionProps {
  profile: ProfileData
  onEdit: () => void
}

export function ProfileSection({ profile, onEdit }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mon Profil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Prénom</p>
            <p className="text-lg">{profile?.first_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="text-lg">{profile?.last_name || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Commune de scolarisation</p>
            <p className="text-lg">{profile?.school_city || '-'}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}