import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"
import * as z from "zod"

export const profileFormSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  school_city: z.string().min(1, "La commune est requise"),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

export function useProfileUpdate() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateProfile = async (values: ProfileFormData, initialEmail: string, onSuccess?: () => void) => {
    try {
      // Update email in auth if changed
      if (values.email !== initialEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        })
        if (emailError) throw emailError
        
        toast({
          title: "Email mis à jour",
          description: "Un email de confirmation vous a été envoyé.",
        })
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          school_city: values.school_city,
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id)

      if (profileError) throw profileError

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      })
      
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      onSuccess?.()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
      })
    }
  }

  return { updateProfile }
}