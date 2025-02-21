
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
import { SchoolCityAlert } from "./register/SchoolCityAlert";

interface RegisterFormProps {
  onSubmit: (values: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}

export const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [showCguAlert, setShowCguAlert] = useState(false);
  const [showSchoolCityAlert, setShowSchoolCityAlert] = useState(false);

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

  useEffect(() => {
    const savedData = localStorage.getItem('registerFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        form.setValue(key as keyof RegisterFormData, parsedData[key]);
      });
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem('registerFormData', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = form.handleSubmit(async (values: RegisterFormData) => {
    if (!values.schoolCity) {
      setShowSchoolCityAlert(true);
      return;
    }
    
    if (!values.acceptedCgu) {
      setShowCguAlert(true);
      return;
    }
    
    localStorage.removeItem('registerFormData');
    await onSubmit(values);
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonalInfoFields form={form} />
          <SecurityFields form={form} />
          <SchoolFields form={form} />
          <TermsFields form={form} />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Form>

      <CguAlert 
        open={showCguAlert} 
        onOpenChange={setShowCguAlert}
      />
      
      <SchoolCityAlert
        open={showSchoolCityAlert}
        onOpenChange={setShowSchoolCityAlert}
      />
    </>
  );
};
