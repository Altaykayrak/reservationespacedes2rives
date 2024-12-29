import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères")
    .regex(/^[A-Za-zÀ-ÿ\s-]+$/, "Le prénom ne doit contenir que des lettres"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères")
    .regex(/^[A-Za-zÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres"),
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
  secretQuestion: z.string().min(1, "Veuillez choisir une question secrète"),
  secretAnswer: z.string().min(1, "Veuillez fournir une réponse"),
  schoolCity: z.string().min(1, "Veuillez choisir une commune"),
});

const secretQuestions = [
  "Quel est le nom de votre premier animal de compagnie ?",
  "Dans quelle ville êtes-vous né(e) ?",
  "Quel est le prénom de votre meilleur(e) ami(e) d'enfance ?",
  "Quel est le nom de votre école primaire ?",
  "Quelle est votre couleur préférée ?",
];

const schoolCities = [
  "Amfreville sous les monts",
  "Le Manoir sur Seine",
  "Pîtres",
];

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      secretQuestion: "",
      secretAnswer: "",
      schoolCity: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (signUpError) throw signUpError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName,
          last_name: values.lastName,
          secret_question: values.secretQuestion,
          secret_answer: values.secretAnswer,
          school_city: values.schoolCity,
        })
        .eq("id", (await supabase.auth.getUser()).data.user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Inscription réussie",
        description:
          "Votre compte a été créé avec succès. Vous allez être redirigé vers la page de connexion.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur lors de l'inscription",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Inscription"
      description="Créez votre compte pour accéder à L'espace des deux rives"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
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
                  <Input
                    type="email"
                    placeholder="jean.dupont@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secretQuestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question secrète</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez une question" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {secretQuestions.map((question) => (
                      <SelectItem key={question} value={question}>
                        {question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secretAnswer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Réponse</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="schoolCity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commune de scolarisation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez une commune" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schoolCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Register;
