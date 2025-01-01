import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "@/schemas/registerSchema";

export const registerUser = async (formData: RegisterFormData) => {
  // 1. Create the user account first
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error("No user data returned");

  // 2. Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 3. Then update the profile with additional information
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name: formData.firstName,
      last_name: formData.lastName,
      secret_question: formData.secretQuestion,
      secret_answer: formData.secretAnswer,
      school_city: formData.schoolCity,
    })
    .eq("id", authData.user.id);

  if (updateError) throw updateError;

  return authData.user;
};