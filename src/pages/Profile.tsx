import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditProfileForm } from "@/components/EditProfileForm"
import { ProfileSection } from "@/components/profile/ProfileSection"
import { ChildrenList } from "@/components/profile/ChildrenList"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const Profile = () => {
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session:", session)
      if (!session) {
        toast.error("Vous devez être connecté pour accéder à cette page")
        navigate("/login")
        return
      }
      setSession(session)
    })
  }, [navigate])
  
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session?.user?.id) return null
      console.log("Fetching profile for user:", session.user.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      if (error) {
        console.error("Profile fetch error:", error)
        throw error
      }
      console.log("Profile data:", data)
      return {
        ...data,
        email: session.user.email,
      }
    },
    enabled: !!session?.user?.id
  })

  const { data: children, isLoading: isLoadingChildren, error: childrenError } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      if (!session?.user?.id) return null
      console.log("Fetching children for user:", session.user.id)
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('profile_id', session.user.id)
      
      if (error) {
        console.error("Children fetch error:", error)
        throw error
      }
      console.log("Children data:", data)
      return data
    },
    enabled: !!session?.user?.id
  })

  if (!session) {
    return null
  }

  if (profileError || childrenError) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
      </div>
    )
  }

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
              <Link to="/reservations">Réservations</Link>
            </Button>
            <Button asChild>
              <Link to="/children">Mes enfants</Link>
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