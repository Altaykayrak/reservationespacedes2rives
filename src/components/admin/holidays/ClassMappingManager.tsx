
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface ClassMappingManagerProps {
  holidayPeriodId: string | null;
  onMappingChange?: () => void;
}

type ClassMapping = {
  id?: string;
  school_class: string;
  category: string;
};

export const ClassMappingManager = ({ 
  holidayPeriodId,
  onMappingChange
}: ClassMappingManagerProps) => {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<ClassMapping[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Récupérer la liste des classes scolaires disponibles
  const { data: schoolClasses } = useQuery({
    queryKey: ["school_class_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("*");
      
      if (error) throw error;
      return data;
    },
  });

  // Récupérer les mappings existants pour cette période (si elle existe)
  const { data: existingMappings, refetch } = useQuery({
    queryKey: ["holiday_period_mappings", holidayPeriodId],
    queryFn: async () => {
      if (!holidayPeriodId) return [];
      
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("*")
        .eq("holiday_period_id", holidayPeriodId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!holidayPeriodId,
  });

  // Initialiser les mappings avec les valeurs par défaut ou existantes
  useEffect(() => {
    if (!schoolClasses) return;
    
    const defaultMappings: ClassMapping[] = schoolClasses.map(schoolClass => {
      // Vérifier si un mapping existe déjà pour cette classe
      const existingMapping = existingMappings?.find(
        mapping => mapping.school_class === schoolClass.name
      );

      // Déterminer la catégorie (existante ou par défaut)
      let defaultCategory = schoolClass.category;
      if (existingMapping) {
        return {
          id: existingMapping.id,
          school_class: schoolClass.name,
          category: existingMapping.category
        };
      }
      
      return {
        school_class: schoolClass.name,
        category: defaultCategory
      };
    });

    setMappings(defaultMappings);
  }, [schoolClasses, existingMappings]);

  const handleCategoryChange = (schoolClass: string, newCategory: string) => {
    setMappings(prevMappings => 
      prevMappings.map(mapping => 
        mapping.school_class === schoolClass 
          ? { ...mapping, category: newCategory }
          : mapping
      )
    );
  };

  const saveClassMappings = async () => {
    if (!holidayPeriodId) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord sauvegarder la période de vacances",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Pour chaque mapping, insérer ou mettre à jour dans la base de données
      const upsertPromises = mappings.map(mapping => {
        const upsertData = {
          holiday_period_id: holidayPeriodId,
          school_class: mapping.school_class,
          category: mapping.category
        };

        return supabase
          .from("holiday_period_class_mappings")
          .upsert(upsertData, { 
            onConflict: 'holiday_period_id,school_class',
            ignoreDuplicates: false
          });
      });

      await Promise.all(upsertPromises);
      
      toast({
        title: "Succès",
        description: "Les catégories de classes ont été mises à jour"
      });
      
      // Rafraîchir les données
      refetch();
      
      // Notifier le parent si besoin
      if (onMappingChange) {
        onMappingChange();
      }

    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde des mappings:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les mappings",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schoolClasses || schoolClasses.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Configuration des catégories par classe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappings.map((mapping) => (
            <div key={mapping.school_class} className="flex items-center gap-2">
              <span className="w-24">{mapping.school_class}</span>
              <Select
                value={mapping.category}
                onValueChange={(value) => handleCategoryChange(mapping.school_class, value)}
                disabled={!holidayPeriodId || isSubmitting}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maternelle">Maternelle</SelectItem>
                  <SelectItem value="primaire">Primaire</SelectItem>
                  <SelectItem value="adolescent">Adolescent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          
          <Button 
            onClick={saveClassMappings} 
            disabled={!holidayPeriodId || isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer les catégories"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassMappingManager;
