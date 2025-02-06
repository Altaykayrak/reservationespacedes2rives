
import * as z from "zod";

export const registerSchema = z.object({
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
  automaticPayment: z.boolean().default(false),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
