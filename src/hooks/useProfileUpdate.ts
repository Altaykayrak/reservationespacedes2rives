
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import * as z from "zod"

export const profileFormSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  automatic_payment: z.boolean().default(false),
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

export function useProfileUpdate() {
  const queryClient = useQueryClient()

  const updateProfile = async (values: ProfileFormData, initialEmail: string, onSuccess?: () => void) => {
    try {
      // Update email in auth if changed
      if (values.email !== initialEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: values.email,
        })
        if (emailError) throw emailError
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          automatic_payment: values.automatic_payment,
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id)

      if (profileError) throw profileError

      toast.success("Profil mis à jour avec succès")
      
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      onSuccess?.()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Une erreur est survenue lors de la mise à jour du profil")
    }
  }

  return { updateProfile }
}
