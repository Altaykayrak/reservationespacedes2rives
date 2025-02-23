
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { RegisterFormData } from "@/schemas/registerSchema";
import { secretQuestions } from "@/constants/registerConstants";
interface SecurityFieldsProps {
  form: UseFormReturn<RegisterFormData>;
}
export const SecurityFields = ({
  form
}: SecurityFieldsProps) => {
  return <>
      <FormField control={form.control} name="secretQuestion" render={({
      field
    }) => <FormItem>
            <FormLabel>Question secrète</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Choisissez une question" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {secretQuestions.map(question => <SelectItem key={question} value={question}>
                    {question}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>} />

      <FormField control={form.control} name="secretAnswer" render={({
      field
    }) => <FormItem>
            <FormLabel className="text-destructive-foreground">Réponse</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage className="text-red-700" />
          </FormItem>} />
    </>;
};
