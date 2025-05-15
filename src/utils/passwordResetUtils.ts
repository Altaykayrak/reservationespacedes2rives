

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
  // Déterminer l'URL de redirection en fonction de l'environnement
  let redirectUrl: string;
  
  // Liste des URL de production connues
  const productionUrls = [
    "https://e2r-reservation.netlify.app",
    "https://reservationespacedes2rives.lovable.app"
  ];
  
  // Vérifier si nous sommes dans un environnement de production connu
  const currentOrigin = window.location.origin;
  if (productionUrls.includes(currentOrigin)) {
    redirectUrl = `${currentOrigin}/reset-password`;
  } else {
    // Pour les environnements de développement local ou autres
    redirectUrl = `${window.location.origin}/reset-password`;
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
  
  if (error) throw error;
  
  // Log pour debug
  console.log("Email de réinitialisation envoyé avec redirectTo:", redirectUrl);
};

