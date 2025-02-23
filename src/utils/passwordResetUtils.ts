
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AuthorizedEmail = Tables<"authorized_emails">;

// Définition simple des types pour éviter les problèmes de profondeur
type SimpleProfile = {
  secret_question: string;
  secret_answer: string;
  email: string;
};

export const checkAuthorizedEmail = async (email: string): Promise<AuthorizedEmail | null> => {
  const { data: authorizedEmail, error: authEmailError } = await supabase
    .from("authorized_emails")
    .select()
    .eq("email", email.trim())
    .maybeSingle();

  if (authEmailError) throw authEmailError;
  return authorizedEmail;
};

export const fetchSecretQuestion = async (email: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("secret_question")
    .eq("email", email.trim())
    .maybeSingle();

  if (error) throw error;
  return data?.secret_question ?? null;
};

export const verifySecretAnswer = async (email: string, secretAnswer: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("secret_answer")
    .eq("email", email.trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  return data.secret_answer.toLowerCase() === secretAnswer.toLowerCase();
};

export const updateUserPassword = async (email: string, newPassword: string) => {
  // Nous utilisons resetPasswordForEmail au lieu de updateUser car c'est plus sécurisé
  // pour une réinitialisation de mot de passe
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
};
