
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Info } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSchoolClassCategories } from "@/hooks/useSchoolClassCategories";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChildSelectorProps {
  selectedChild: string;
  setSelectedChild: (childId: string) => void;
  children: Tables<"children">[] | null | undefined;
  setSelectedDates?: (dates: any[]) => void;
  onCM2SummerPeriodCheck?: (isInSummerPeriod: boolean) => void;
}

export const ChildSelector = ({ 
  selectedChild, 
  setSelectedChild, 
  children,
  setSelectedDates,
  onCM2SummerPeriodCheck
}: ChildSelectorProps) => {
  const location = useLocation();
  const isHolidayReservation = location.pathname === "/holiday-reservations";
  const isTeenHolidayReservation = location.pathname === "/teenholiday-reservations";
  const { getClassCategorySync } = useSchoolClassCategories();

  // Récupérer l'ID de période à partir de l'URL si présent
  const searchParams = new URLSearchParams(location.search);
  const periodId = searchParams.get("periodId");

  // Vérifier si c'est une période d'été
  const { data: periodInfo } = useQuery({
    queryKey: ["period_summer_check", periodId],
    queryFn: async () => {
      if (!periodId) return null;
      
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("name")
        .eq("id", periodId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!periodId
  });

  // Liste des périodes d'été
  const summerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04", "ETE-05", "ETE-06", "ETE-07", "ETE-08"];
  const isSummerPeriod = periodInfo?.name && summerPeriods.includes(periodInfo.name);
  
  // Périodes d'été où les CM2 doivent s'inscrire en Club Ado
  const cm2TeenSummerPeriods = ["ETE-01", "ETE-02", "ETE-03", "ETE-04"];
  const isCM2TeenPeriod = useMemo(() => {
    return periodInfo?.name && cm2TeenSummerPeriods.includes(periodInfo.name);
  }, [periodInfo, cm2TeenSummerPeriods]);

  console.log(`Période actuelle: ${periodInfo?.name}, Est période CM2 Teen: ${isCM2TeenPeriod}`);

  // Filtrer les enfants qui sont dans le groupe adolescent ou CM2 pendant certaines périodes d'été
  const filteredChildren = useMemo(() => {
    if (!children) return [];

    return isHolidayReservation ? children.filter(child => {
      console.log(`Vérification de l'enfant ${child.first_name} ${child.last_name} - Classe: ${child.school_class}`);
        
      // Normalisation de la classe pour une comparaison cohérente
      const normalizedClass = child.school_class.trim().toUpperCase();
        
      // Vérification explicite pour les CM2 pendant les périodes spécifiques
      if (isCM2TeenPeriod && normalizedClass === "CM2") {
        console.log(`${child.first_name} est en CM2 et période ${periodInfo?.name} - filtré (Teen summer)`);
        return false;
      }
        
      // Filtrer les adolescents dans tous les cas
      const category = getClassCategorySync(child.school_class, periodId);
      console.log(`Catégorie pour ${child.first_name}: ${category}`);
      return category !== 'adolescent';
    }) : children;
  }, [children, isHolidayReservation, isCM2TeenPeriod, periodInfo?.name, getClassCategorySync, periodId]);

  // Réinitialiser les dates lorsqu'un nouvel enfant est sélectionné
  useEffect(() => {
    if (selectedChild && setSelectedDates) {
      setSelectedDates([]);
    }
  }, [selectedChild, setSelectedDates]);

  // Vérifier les cas spéciaux pour CM2
  useEffect(() => {
    if (selectedChild && periodId && isSummerPeriod) {
      const selectedChildData = children?.find(child => child.id === selectedChild);
      
      if (selectedChildData?.school_class === "CM2") {
        // Notifier le parent si la fonction de callback est fournie
        if (onCM2SummerPeriodCheck) {
          if (isHolidayReservation) {
            onCM2SummerPeriodCheck(true);
          } else if (isTeenHolidayReservation) {
            onCM2SummerPeriodCheck(false);
          }
        }
      } else if (onCM2SummerPeriodCheck) {
        onCM2SummerPeriodCheck(false);
      }
    } else if (onCM2SummerPeriodCheck) {
      onCM2SummerPeriodCheck(false);
    }
  }, [selectedChild, periodId, isSummerPeriod, children, onCM2SummerPeriodCheck, isHolidayReservation, isTeenHolidayReservation]);

  // Si l'enfant sélectionné n'est plus dans la liste filtrée, le désélectionner
  useEffect(() => {
    if (selectedChild && filteredChildren) {
      const isChildInFilteredList = filteredChildren.some(child => child.id === selectedChild);
      if (!isChildInFilteredList) {
        console.log(`L'enfant sélectionné n'est plus dans la liste filtrée - désélection`);
        setSelectedChild("");
      }
    }
  }, [filteredChildren, selectedChild, setSelectedChild]);

  if (!filteredChildren || filteredChildren.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Aucun enfant trouvé. Veuillez ajouter un enfant depuis votre profil.
        </AlertDescription>
      </Alert>
    );
  }

  // CM2 en période d'été sur la page des réservations standard
  const showCM2Message = selectedChild && 
                         isSummerPeriod && 
                         isHolidayReservation && 
                         children?.find(child => child.id === selectedChild)?.school_class === "CM2";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="child">Sélectionner un enfant</Label>
        <Select
          value={selectedChild}
          onValueChange={(value) => {
            setSelectedChild(value);
          }}
        >
          <SelectTrigger id="child" className="w-full">
            <SelectValue placeholder="Sélectionner un enfant" />
          </SelectTrigger>
          <SelectContent>
            {filteredChildren.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.first_name} {child.last_name} - {child.school_class}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showCM2Message && (
        <Alert className="bg-amber-50 text-amber-800 border-amber-300">
          <AlertDescription className="text-sm">
            <p><strong>Information importante :</strong></p>
            <p>Durant l'été, les élèves de CM2 doivent s'inscrire aux activités Club Ado.</p>
            <p>Veuillez vous rendre sur la page <a href="/teenholiday-reservations" className="underline font-medium">Réservations Club Ado</a> pour inscrire cet enfant.</p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
