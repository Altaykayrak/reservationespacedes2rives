
import { Link, useLocation } from "react-router-dom";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";

interface TermsFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}

export const TermsFields = ({ form }: TermsFieldsProps) => {
  const location = useLocation();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="automaticPayment"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal">Je souhaite m'inscrire au prélèvement automatique</FormLabel>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="acceptedCgu"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="text-sm font-normal">
                J'ai lu et j'accepte les{" "}
                <Link 
                  to="/terms-of-service"
                  state={{ from: location.pathname }}
                  className="text-[#8B5CF6] hover:underline font-medium"
                  target="_blank"
                >
                  conditions générales d'utilisation
                </Link>
                {" "}et le{" "}
                <Link 
                  to="/terms-of-service#reglement-fonctionnement"
                  state={{ from: location.pathname }}
                  className="text-[#8B5CF6] hover:underline font-medium"
                  target="_blank"
                >
                  règlement de fonctionnement
                </Link>
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};
