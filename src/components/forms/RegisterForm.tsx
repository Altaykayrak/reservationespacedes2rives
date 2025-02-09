
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/schemas/registerSchema";
import { useState } from "react";
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

  const handleSubmit = async (values: RegisterFormData) => {
    if (!values.acceptedCgu) {
      setShowCguAlert(true);
      return;
    }
    await onSubmit(values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <PersonalInfoFields form={form} />
          <SecurityFields form={form} />
          <SchoolFields form={form} />
          <TermsFields form={form} />

          <Button type="submit" className="w-full" disabled={isLoading}>
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
