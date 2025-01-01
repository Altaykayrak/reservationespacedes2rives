import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditProfileForm } from "@/components/EditProfileForm"
import { ProfileSection } from "@/components/profile/ProfileSection"
import { ChildrenList } from "@/components/profile/ChildrenList"
import { useEffect, useState } from "react"

const Profile = () => {
  const [session, setSession] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
  }, [])
  
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single()
      
      if (error) throw error
      return {
        ...data,
        email: session?.user?.email,
      }
    },
    enabled: !!session?.user?.id
  })

  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', session?.user?.id)
      
      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  if (isLoadingProfile || isLoadingChildren) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-end gap-4 mb-8">
            <Button asChild>
              <Link to="/reservation-mercredi">Réservation Mercredi</Link>
            </Button>
            <Button asChild>
              <Link to="/reservation-vacances">Réservation Vacances</Link>
            </Button>
          </div>

          {profile && (
            <ProfileSection 
              profile={profile} 
              onEdit={() => setIsEditDialogOpen(true)} 
            />
          )}

          {children && <ChildrenList children={children} />}

          <div className="mt-6 flex justify-end">
            <Button asChild variant="outline">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
          </DialogHeader>
          {profile && (
            <EditProfileForm 
              initialData={profile} 
              onSuccess={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile