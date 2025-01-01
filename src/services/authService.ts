import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "@/schemas/registerSchema";

export const registerUser = async (formData: RegisterFormData) => {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        secretQuestion: formData.secretQuestion,
        secretAnswer: formData.secretAnswer,
        schoolCity: formData.schoolCity,
      },
    },
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error("No user data returned");

  return authData.user;
};