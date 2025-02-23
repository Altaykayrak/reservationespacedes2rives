
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AuthorizedEmail = Tables<"authorized_emails">;
type Profile = Tables<"profiles">;

export const checkAuthorizedEmail = async (email: string): Promise<AuthorizedEmail | null> => {
  const { data: authorizedEmail, error: authEmailError } = await supabase
    .from("authorized_emails")
    .select()
    .eq("email", email.trim())
    .maybeSingle();

  if (authEmailError) throw authEmailError;
  return authorizedEmail;
};

export const fetchSecretQuestion = async (email: string): Promise<{ secret_question: string } | null> => {
  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("secret_question")
    .eq("email", email.trim())
    .maybeSingle();

  if (profileError) throw profileError;
  return data;
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

  return profile.secret_answer?.toLowerCase() === secretAnswer.toLowerCase();
};

export const updateUserPassword = async (email: string, newPassword: string) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};
