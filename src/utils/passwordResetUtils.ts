import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type AuthorizedEmail = Tables<"authorized_emails">;
type Profile = Tables<"profiles">;

export const checkEmailAuthorization = async (email: string) => {
  const { data: authorizedEmail } = await supabase
    .from("authorized_emails")
    .select()
    .eq("email", email)
    .maybeSingle();

  return !!authorizedEmail;
};

export const checkSecretAnswer = async (email: string, answer: string) => {
  const { data: user } = await supabase.auth.admin.getUserByEmail(email);
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return false;

  return profile.secret_answer.toLowerCase() === answer.toLowerCase();
};

export const updateUserPassword = async (email: string, newPassword: string) => {
  const { error } = await supabase.auth.admin.updateUserById(
    email,
    { password: newPassword }
  );

  if (error) throw error;
};