
import * as z from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne doit pas dépasser 50 caractères")
    .regex(/^[A-Za-zÀ-ÿ\s-]+$/, "Le prénom ne doit contenir que des lettres")
    .trim()
    .min(1, "Le prénom est requis"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne doit pas dépasser 50 caractères")
    .regex(/^[A-Za-zÀ-ÿ\s-]+$/, "Le nom ne doit contenir que des lettres")
    .trim()
    .min(1, "Le nom est requis"),
  email: z
    .string()
    .email("Format d'email invalide")
    .trim()
    .min(1, "L'email est requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .trim()
    .min(1, "Le mot de passe est requis"),
  automaticPayment: z
    .boolean()
    .default(false),
  acceptedCgu: z
    .boolean()
    .default(false),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
