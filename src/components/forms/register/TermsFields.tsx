
import { Link } from "react-router-dom";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";
import { useState, useEffect } from "react";

interface TermsFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export const TermsFields = ({ form }: TermsFieldsProps) => {
  const [shouldShake, setShouldShake] = useState(false);
  const acceptedCgu = form.watch("acceptedCgu");
  const { isSubmitting } = form.formState;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (shouldShake) {
      timeout = setTimeout(() => {
        setShouldShake(false);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [shouldShake]);

  // Surveille l'état de soumission du formulaire
  useEffect(() => {
    if (isSubmitting && !acceptedCgu) {
      setShouldShake(true);
    }
  }, [isSubmitting, acceptedCgu]);

  return (
    <>
      <FormField
        control={form.control}
        name="automaticPayment"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="leading-none">
              <FormLabel>
                Prélèvement automatique pour régler vos factures (familles ayant
                fourni un RIB)
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="acceptedCgu"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div 
              className={`leading-none ${shouldShake && !acceptedCgu ? 'animate-shake text-destructive-foreground' : ''}`}
              style={{
                animation: shouldShake && !acceptedCgu ? 'shake 0.5s ease-in-out' : 'none',
              }}
            >
              <FormLabel>
                J'ai pris connaissance{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">
                  des conditions générales d'utilisation
                </Link>{" "}
                et je les approuve
              </FormLabel>
            </div>
          </FormItem>
        )}
      />
    </>
  );
};
