import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";
interface PersonalInfoFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}
export const PersonalInfoFields = ({
  form
}: PersonalInfoFieldsProps) => {
  return <>
      <FormField control={form.control} name="firstName" render={({
      field
    }) => <FormItem>
            <FormLabel>Prénom</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage className="text-red-700" />
          </FormItem>} />

      <FormField control={form.control} name="lastName" render={({
      field
    }) => <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage className="text-red-700" />
          </FormItem>} />

      <FormField control={form.control} name="email" render={({
      field
    }) => <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage className="text-red-700" />
          </FormItem>} />

      <FormField control={form.control} name="password" render={({
      field
    }) => <FormItem>
            <FormLabel>Mot de passe</FormLabel>
            <FormControl>
              <PasswordInput {...field} />
            </FormControl>
            <FormMessage className="text-red-700" />
          </FormItem>} />
    </>;
};