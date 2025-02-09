
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

interface TermsFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export const TermsFields = ({ form }: TermsFieldsProps) => {
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
            <div className="leading-none">
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
