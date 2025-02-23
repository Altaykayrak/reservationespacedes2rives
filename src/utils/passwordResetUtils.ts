
import { supabase } from "@/integrations/supabase/client";

// Définition explicite des types dont nous avons besoin
interface AuthorizedEmail {
  id: string;
  email: string;
  email_lower: string | null;
  created_at: string;
  updated_at: string;
}

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
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
};
