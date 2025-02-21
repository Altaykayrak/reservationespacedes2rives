import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";
import { schoolCities } from "@/constants/registerConstants";
interface SchoolFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}
export const SchoolFields = ({
  form
}: SchoolFieldsProps) => {
  return <FormField control={form.control} name="schoolCity" render={({
    field
  }) => <FormItem>
          <FormLabel>Commune de scolarisation</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une commune" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {schoolCities.map(city => <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage className="text-red-700" />
        </FormItem>} />;
};