
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
    .select("id, email, email_lower, created_at, updated_at")
    .eq("email", email.trim())
    .maybeSingle();

  if (authEmailError) throw authEmailError;
  return authorizedEmail as AuthorizedEmail | null;
};

export const sendPasswordResetEmail = async (email: string) => {
  // Utiliser l'URL courante du navigateur pour déterminer l'URL de base
  const baseUrl = window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`
  });
  
  if (error) throw error;
  
  // Log pour debug
  console.log("Email de réinitialisation envoyé avec redirectTo:", `${baseUrl}/reset-password`);
};
