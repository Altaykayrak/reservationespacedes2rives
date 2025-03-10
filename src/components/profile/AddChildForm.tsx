
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Child } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddChildFormProps {
  onSuccess: () => void;
  initialData?: Child;
}

export function AddChildForm({
  onSuccess,
  initialData
}: AddChildFormProps) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      school_class: initialData?.school_class || ""
    }
  });
  
  const queryClient = useQueryClient();

  // Fetch school classes
  const {
    data: schoolClasses = []
  } = useQuery({
    queryKey: ['school-classes'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('school_class').select('*').order('order', {
        ascending: true
      });
      if (error) throw error;
      return data;
    }
  });
  
  const onSubmit = async (values: {
    first_name: string;
    last_name: string;
    school_class: string;
  }) => {
    try {
      // Verify all fields are filled
      if (!values.first_name.trim() || !values.last_name.trim() || !values.school_class) {
        toast.error("Veuillez remplir tous les champs");
        return;
      }
      
      console.log("Form submission values:", values);

      if (initialData) {
        console.log("Updating existing child:", initialData.id);
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update({
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            school_class: values.school_class
          })
          .eq('id', initialData.id);
          
        if (error) {
          console.error('Error updating child:', error);
          throw error;
        }
        
        console.log("Child updated successfully");
        
        // Force refresh of data
        await queryClient.invalidateQueries({
          queryKey: ['children']
        });
        
        toast.success("Enfant modifié avec succès");
      } else {
        // Create new child
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("No user found");
        
        console.log("Creating new child for user:", user.id);
        
        const { error } = await supabase
          .from('children')
          .insert([{
            profile_id: user.id,
            first_name: values.first_name.trim(),
            last_name: values.last_name.trim(),
            school_class: values.school_class
          }]);
          
        if (error) {
          console.error('Error creating child:', error);
          throw error;
        }
        
        console.log("Child created successfully");
        
        toast.success("Enfant ajouté avec succès");
      }

      // Force refresh of data
      await queryClient.invalidateQueries({
        queryKey: ['children']
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving child:', error);
      toast.error(initialData ? "Erreur lors de la modification de l'enfant" : "Erreur lors de l'ajout de l'enfant");
    }
  };
  
  const schoolClass = watch('school_class');
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="first_name">Prénom</Label>
        <Input 
          id="first_name" 
          {...register("first_name", {
            required: "Le prénom est requis",
            validate: value => value.trim() !== "" || "Le prénom ne peut pas être vide"
          })} 
        />
        {errors.first_name && <p className="text-sm text-red-700">{errors.first_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">Nom</Label>
        <Input 
          id="last_name" 
          {...register("last_name", {
            required: "Le nom est requis",
            validate: value => value.trim() !== "" || "Le nom ne peut pas être vide"
          })} 
        />
        {errors.last_name && <p className="text-sm text-destructive-foreground">{errors.last_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="school_class">Classe</Label>
        <Select 
          value={schoolClass} 
          onValueChange={value => setValue('school_class', value, {
            shouldValidate: true,
            shouldDirty: true
          })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une classe" />
          </SelectTrigger>
          <SelectContent>
            {schoolClasses.map(schoolClass => (
              <SelectItem key={schoolClass.id} value={schoolClass.name}>
                {schoolClass.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!schoolClass && <p className="text-sm text-destructive-foreground">La classe est requise</p>}
      </div>

      <Button type="submit" disabled={isSubmitting || !schoolClass}>
        {initialData ? "Modifier" : "Ajouter"}
      </Button>
    </form>
  );
}
