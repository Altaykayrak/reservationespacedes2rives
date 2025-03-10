
import { supabase } from "@/integrations/supabase/client";
import type { RegisterFormData } from "@/schemas/registerSchema";

const checkAuthorizedEmail = async (email: string) => {
  // Remove all whitespace and convert to lowercase for maximum compatibility
  const cleanEmail = email.trim().toLowerCase();
  console.log("Checking email:", cleanEmail);
  
  // First approach: Try a simple contains query
  const { data: containsData, error: containsError } = await supabase
    .from("authorized_emails")
    .select("email")
    .ilike("email", `%${cleanEmail}%`)
    .maybeSingle();

  console.log("Contains query results:", { containsData, containsError });
  
  if (containsError) {
    console.error("Database error in contains query:", containsError);
  }
  
  if (containsData) {
    console.log("Email found with contains query:", containsData.email);
    return true;
  }

  // Second approach: Try direct equality with ILIKE for case insensitivity
  const { data, error } = await supabase
    .from("authorized_emails")
    .select("email")
    .ilike("email", cleanEmail)
    .maybeSingle();

  console.log("ILIKE query parameters:", { cleanEmail });
  console.log("ILIKE query result:", { data, error });
  
  if (error) {
    console.error("Database error in ILIKE query:", error);
  }
  
  if (data) {
    console.log("Email found with ILIKE query:", data.email);
    return true;
  }

  // Third approach: Try exact match as last resort
  const { data: exactData, error: exactError } = await supabase
    .from("authorized_emails")
    .select("email")
    .eq("email", cleanEmail)
    .maybeSingle();

  console.log("Exact match query result:", { exactData, exactError });
  
  if (exactError) {
    console.error("Database error in exact match query:", exactError);
  }
  
  if (exactData) {
    console.log("Email found with exact match:", exactData.email);
    return true;
  }

  // Final approach: Try to fetch all authorized emails and check manually
  // This is a last resort to see what's in the table
  const { data: allEmails, error: allEmailsError } = await supabase
    .from("authorized_emails")
    .select("email");
    
  if (allEmailsError) {
    console.error("Error fetching all emails:", allEmailsError);
  } else {
    console.log("All authorized emails in the database:", allEmails);
    console.log("Total count of authorized emails:", allEmails.length);
    
    // Try to find any similar emails for debugging purposes
    const similarEmails = allEmails.filter(entry => 
      entry.email.toLowerCase().includes(cleanEmail.split('@')[0].toLowerCase())
    );
    
    if (similarEmails.length > 0) {
      console.log("Similar emails found in database:", similarEmails);
    }
  }

  console.log("Email not found in any query. Not authorized.");
  return false;
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
