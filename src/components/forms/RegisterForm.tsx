import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { registerSchema, type RegisterFormData } from "@/schemas/registerSchema";
import { useState, useEffect } from "react";
import { PersonalInfoFields } from "./register/PersonalInfoFields";
import { TermsFields } from "./register/TermsFields";
import { CguAlert } from "./register/CguAlert";
interface RegisterFormProps {
  onSubmit: (values: RegisterFormData) => Promise<void>;
  isLoading: boolean;
}
export const RegisterForm = ({
  onSubmit,
  isLoading
}: RegisterFormProps) => {
  const [showCguAlert, setShowCguAlert] = useState(false);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      automaticPayment: false,
      acceptedCgu: false
    }
  });
  useEffect(() => {
    const savedData = localStorage.getItem('registerFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach(key => {
        form.setValue(key as keyof RegisterFormData, parsedData[key]);
      });
    }
  }, [form]);
  useEffect(() => {
    const subscription = form.watch(data => {
      localStorage.setItem('registerFormData', JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [form]);
  const handleSubmit = form.handleSubmit(async (values: RegisterFormData) => {
    if (!values.acceptedCgu) {
      setShowCguAlert(true);
      return;
    }
    localStorage.removeItem('registerFormData');
    await onSubmit(values);
  });
  return <>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonalInfoFields form={form} />
          <TermsFields form={form} />

          <Button type="submit" disabled={isLoading} className="w-full bg-purple-300 hover:bg-purple-200 text-purple-800 font-semibold">
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Form>

      <CguAlert open={showCguAlert} onOpenChange={setShowCguAlert} />
    </>;
};