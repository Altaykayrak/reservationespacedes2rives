import { supabase } from "@/integrations/supabase/client";

interface AuthorizedEmail {
  email: string;
}

interface Profile {
  secret_question: string;
  secret_answer?: string;
}

export const checkAuthorizedEmail = async (email: string): Promise<AuthorizedEmail | null> => {
  const { data: authorizedEmail, error: authEmailError } = await supabase
    .from("authorized_emails")
    .select("email")
    .eq("email", email.trim())
    .maybeSingle();

  if (authEmailError) throw authEmailError;
  return authorizedEmail;
};

export const fetchSecretQuestion = async (email: string): Promise<Profile | null> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("secret_question")
    .eq("email", email.trim())
    .maybeSingle();

  if (profileError) throw profileError;
  return profile;
};

export const verifySecretAnswer = async (email: string, secretAnswer: string): Promise<boolean> => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("secret_answer")
    .eq("email", email.trim())
    .maybeSingle();

  if (profileError || !profile) {
    throw profileError || new Error("Profile not found");
  }

  return profile.secret_answer.toLowerCase() === secretAnswer.toLowerCase();
};