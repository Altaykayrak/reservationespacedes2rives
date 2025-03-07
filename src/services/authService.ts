
import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "@/schemas/registerSchema";

const checkAuthorizedEmail = async (email: string) => {
  const cleanEmail = email.trim();
  console.log("Checking email:", cleanEmail);
  
  const { data, error } = await supabase
    .from("authorized_emails")
    .select("email")
    .eq("email_lower", cleanEmail.toLowerCase())
    .maybeSingle();

  console.log("Query parameters:", { cleanEmail });
  console.log("Full query result:", { data, error });
  console.log("Raw data:", data);
  
  if (error) {
    console.error("Database error:", error);
    throw error;
  }

  const isAuthorized = !!data;
  console.log("Is email authorized?", isAuthorized);
  return isAuthorized;
};

export const registerUser = async (formData: RegisterFormData) => {
  const isAuthorized = await checkAuthorizedEmail(formData.email);
  
  console.log("Is authorized:", isAuthorized);
  
  if (!isAuthorized) {
    throw new Error(
      "Vous n'êtes pas encore inscrit à l'espace des Deux Rives, merci de nous contacter au 02 32 68 32 10 afin de prendre rendez-vous."
    );
  }

  try {
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          automaticPayment: formData.automaticPayment,
          acceptedCgu: formData.acceptedCgu,
        },
      },
    });

    if (signUpError) {
      // Check if error is related to existing user
      if (signUpError.message.includes("User already registered")) {
        throw new Error("Il existe déjà un compte avec cette adresse email. Merci de cliquer sur le lien ci-dessous pour vous connecter.");
      }
      throw signUpError;
    }
    
    if (!authData.user) throw new Error("No user data returned");

    return authData.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};
