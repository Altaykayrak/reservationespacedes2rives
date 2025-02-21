
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/schemas/registerSchema";
import { useState, useEffect } from "react";
import { PersonalInfoFields } from "./register/PersonalInfoFields";
import { SecurityFields } from "./register/SecurityFields";
import { SchoolFields } from "./register/SchoolFields";
import { TermsFields } from "./register/TermsFields";
import { CguAlert } from "./register/CguAlert";

interface RegisterFormProps {
  onSubmit: (values: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}

export const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [showCguAlert, setShowCguAlert] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      secretQuestion: "",
      secretAnswer: "",
      schoolCity: "",
      automaticPayment: false,
      acceptedCgu: false,
    },
  });

  // Charger les données sauvegardées au chargement du composant
  useEffect(() => {
    const savedData = localStorage.getItem('registerFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        form.setValue(key as keyof RegisterFormData, parsedData[key]);
      });
    }
  }, [form]);

  // Sauvegarder les données lorsqu'elles changent
  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem('registerFormData', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (values: RegisterFormData) => {
    console.log("=== DÉBUT DE handleSubmit ===");
    console.log("Formulaire soumis avec les valeurs:", values);
    console.log("CGU acceptées ?", values.acceptedCgu);
    
    if (!values.acceptedCgu) {
      console.log("CGU non acceptées, tentative d'affichage de la popup");
      setShowCguAlert(true);
      console.log("showCguAlert défini à true");
      return;
    }
    console.log("CGU acceptées, continuation de l'inscription");
    
    // Nettoyer le localStorage après une soumission réussie
    localStorage.removeItem('registerFormData');
    await onSubmit(values);
    console.log("=== FIN DE handleSubmit ===");
  };

  useEffect(() => {
    console.log("showCguAlert a changé :", showCguAlert);
  }, [showCguAlert]);

  // Ajout d'un gestionnaire pour les erreurs de validation
  console.log("Erreurs de validation:", form.formState.errors);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => {
          console.log("Form onSubmit déclenché");
          handleSubmit(values);
        })} className="space-y-4">
          <PersonalInfoFields form={form} />
          <SecurityFields form={form} />
          <SchoolFields form={form} />
          <TermsFields form={form} />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            onClick={() => {
              console.log("Bouton cliqué, valeurs du formulaire:", form.getValues());
              console.log("État de validation:", form.formState.isValid);
            }}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Form>

      <CguAlert 
        open={showCguAlert} 
        onOpenChange={setShowCguAlert}
      />
    </>
  );
};
