import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SchoolClassCategories = () => {
  const [className, setClassName] = useState("");
  const [category, setCategory] = useState<"maternelle" | "primaire" | "adolescent">("maternelle");
  const { toast } = useToast();

  const { data: categories, refetch } = useQuery({
    queryKey: ["school_class_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*")
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddClass = async () => {
    if (!className || !category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("school_class_categories")
        .insert({ name: className, category });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La classe a été ajoutée avec succès",
      });

      setClassName("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      const { error } = await supabase
        .from("school_class_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "La classe a été supprimée avec succès",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Gestion des catégories de classes</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="className">Nom de la classe</Label>
          <Input
            id="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Ex: CP, CE1, etc."
          />
        </div>

        <div>
          <Label>Catégorie</Label>
          <RadioGroup value={category} onValueChange={(value: "maternelle" | "primaire" | "adolescent") => setCategory(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="maternelle" id="maternelle" />
              <Label htmlFor="maternelle">Maternelle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="primaire" id="primaire" />
              <Label htmlFor="primaire">Primaire</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="adolescent" id="adolescent" />
              <Label htmlFor="adolescent">Adolescent</Label>
            </div>
          </RadioGroup>
        </div>

        <Button onClick={handleAddClass} className="w-full">
          Ajouter la classe
        </Button>

        <div className="mt-6 space-y-2">
          <h3 className="font-medium">Classes configurées</h3>
          {categories?.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <span className="font-medium">{cat.name}</span>
                <span className="ml-2 text-sm text-gray-600">({cat.category})</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteClass(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SchoolClassCategories;