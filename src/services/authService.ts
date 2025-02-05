
import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "@/schemas/registerSchema";

const checkAuthorizedEmail = async (email: string) => {
  console.log("Checking email:", email);
  
  const { data, error } = await supabase
    .from("authorized_emails")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  console.log("Query result:", { data, error });

  if (error && error.code !== "PGRST116") {
    console.error("Database error:", error);
    throw error;
  }

  return !!data;
};

export const registerUser = async (formData: RegisterFormData) => {
  const isAuthorized = await checkAuthorizedEmail(formData.email);
  
  console.log("Is authorized:", isAuthorized);
  
  if (!isAuthorized) {
    throw new Error(
      "Vous n'êtes pas encore inscrit à l'espace des Deux Rives, merci de nous contacter au 02 32 68 32 10 afin de prendre rendez-vous."
    );
  }

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
