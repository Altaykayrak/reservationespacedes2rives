
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2 } from "lucide-react";
import { availableHolidayPeriodSchema } from "@/lib/validations/available-holiday-period";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddHolidayPeriodFormProps {
  onSuccess?: () => void;
}

export const AddHolidayPeriodForm = ({ onSuccess }: AddHolidayPeriodFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof availableHolidayPeriodSchema>>({
    resolver: zodResolver(availableHolidayPeriodSchema),
    defaultValues: {
      name: "",
      start_date: undefined,
      end_date: undefined,
      max_participants_kindergarten: 40,
      max_participants_primary: 40,
      max_participants_teen: 40
    },
  });

  const onSubmit = async (values: z.infer<typeof availableHolidayPeriodSchema>) => {
    console.log("Fonction onSubmit déclenchée avec les valeurs:", values);
    setIsSubmitting(true);
    try {
      console.log("Envoi des données à Supabase:", {
        name: values.name,
        start_date: format(values.start_date as Date, "yyyy-MM-dd"),
        end_date: format(values.end_date as Date, "yyyy-MM-dd"),
        max_participants_kindergarten: values.max_participants_kindergarten,
        max_participants_primary: values.max_participants_primary,
        max_participants_teen: values.max_participants_teen
      });

      const { data, error } = await supabase
        .from("available_holiday_periods")
        .insert([
          {
            name: values.name,
            start_date: format(values.start_date as Date, "yyyy-MM-dd"),
            end_date: format(values.end_date as Date, "yyyy-MM-dd"),
            max_participants_kindergarten: values.max_participants_kindergarten,
            max_participants_primary: values.max_participants_primary,
            max_participants_teen: values.max_participants_teen
          },
        ])
        .select();

      if (error) {
        console.error("Erreur lors de l'ajout de la période de vacances:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter la période de vacances: " + error.message,
          variant: "destructive",
        });
      } else {
        console.log("Période de vacances ajoutée avec succès:", data);
        toast({
          title: "Succès",
          description: "Période de vacances ajoutée avec succès",
        });
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Exception lors de l'ajout de la période de vacances:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout de la période de vacances.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("État du formulaire:", form.formState);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de la période" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date de début</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        type="button"
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        console.log("Date de début sélectionnée:", date);
                        field.onChange(date);
                      }}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                      locale={fr}
                      weekStartsOn={1}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Date de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        type="button"
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        console.log("Date de fin sélectionnée:", date);
                        field.onChange(date);
                      }}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                      locale={fr}
                      weekStartsOn={1}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="max_participants_kindergarten"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre maximum de participants (Maternelle)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="40" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_participants_primary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre maximum de participants (Primaire)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="40" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="max_participants_teen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre maximum de participants (Adolescent)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="40" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
          onClick={() => {
            console.log("Bouton de soumission cliqué");
            console.log("Valeurs du formulaire:", form.getValues());
            console.log("Erreurs du formulaire:", form.formState.errors);
          }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement en cours...
            </span>
          ) : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
};

// Export the component as default for compatibility with the import in AdminHolidays.tsx
export default AddHolidayPeriodForm;
