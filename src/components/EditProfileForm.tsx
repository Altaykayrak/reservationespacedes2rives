import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ProfileData } from "@/types/profile"
import { useProfileUpdate, profileFormSchema, ProfileFormData } from "@/hooks/useProfileUpdate"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EditProfileFormProps {
  initialData: ProfileData
  onSuccess: () => void
}

export function EditProfileForm({ initialData, onSuccess }: EditProfileFormProps) {
  const { updateProfile, verifySecretAnswer } = useProfileUpdate()
  const [showSecretQuestion, setShowSecretQuestion] = useState(false)
  const [secretAnswer, setSecretAnswer] = useState("")

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      email: initialData.email,
      school_city: initialData.school_city,
      automatic_payment: initialData.automatic_payment || false,
    },
  })

  const onSubmit = async (values: ProfileFormData) => {
    if (values.email !== initialData.email) {
      setShowSecretQuestion(true)
      return
    }
    await updateProfile(values, initialData.email, () => {
      onSuccess()
      window.location.reload()
    })
  }

  const handleSecretAnswer = async () => {
    const isValid = await verifySecretAnswer(secretAnswer)
    if (isValid) {
      const values = form.getValues()
      await updateProfile(values, initialData.email, () => {
        setShowSecretQuestion(false)
        onSuccess()
        window.location.reload()
      })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="school_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commune de scolarisation</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="automatic_payment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Prélèvement automatique</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    J'ai opté pour le prélèvement automatique de mes factures
                  </p>
                </div>
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Form>

      <Dialog open={showSecretQuestion} onOpenChange={setShowSecretQuestion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérification de sécurité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour changer votre email, veuillez répondre à votre question secrète :
            </p>
            <p className="font-medium">{initialData.secret_question}</p>
            <Input
              type="text"
              placeholder="Votre réponse"
              value={secretAnswer}
              onChange={(e) => setSecretAnswer(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowSecretQuestion(false)}>
                Annuler
              </Button>
              <Button onClick={handleSecretAnswer}>Valider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}