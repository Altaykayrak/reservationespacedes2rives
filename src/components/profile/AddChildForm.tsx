import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  last_name: z.string().min(1, "Le nom est requis"),
  school_class: z.enum([
    "Petite Section",
    "Moyenne Section",
    "Grande Section",
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "6ème",
    "5ème",
    "4ème",
    "3ème",
    "Seconde",
    "Première",
    "Terminale",
  ], {
    required_error: "La classe est requise",
  }),
})

type FormData = z.infer<typeof formSchema>

interface AddChildFormProps {
  onSuccess: () => void
}

export function AddChildForm({ onSuccess }: AddChildFormProps) {
  const queryClient = useQueryClient()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
    },
  })

  const onSubmit = async (values: FormData) => {
    try {
      const { error } = await supabase
        .from("children")
        .insert({
          first_name: values.first_name,
          last_name: values.last_name,
          school_class: values.school_class,
          profile_id: (await supabase.auth.getUser()).data.user?.id,
        })

      if (error) throw error

      toast.success("Enfant ajouté avec succès")
      queryClient.invalidateQueries({ queryKey: ["children"] })
      onSuccess()
    } catch (error) {
      console.error("Error adding child:", error)
      toast.error("Une erreur est survenue lors de l'ajout de l'enfant")
    }
  }

  return (
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
          name="school_class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classe</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Petite Section">Petite Section</SelectItem>
                  <SelectItem value="Moyenne Section">Moyenne Section</SelectItem>
                  <SelectItem value="Grande Section">Grande Section</SelectItem>
                  <SelectItem value="CP">CP</SelectItem>
                  <SelectItem value="CE1">CE1</SelectItem>
                  <SelectItem value="CE2">CE2</SelectItem>
                  <SelectItem value="CM1">CM1</SelectItem>
                  <SelectItem value="CM2">CM2</SelectItem>
                  <SelectItem value="6ème">6ème</SelectItem>
                  <SelectItem value="5ème">5ème</SelectItem>
                  <SelectItem value="4ème">4ème</SelectItem>
                  <SelectItem value="3ème">3ème</SelectItem>
                  <SelectItem value="Seconde">Seconde</SelectItem>
                  <SelectItem value="Première">Première</SelectItem>
                  <SelectItem value="Terminale">Terminale</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="submit">Ajouter</Button>
        </div>
      </form>
    </Form>
  )
}