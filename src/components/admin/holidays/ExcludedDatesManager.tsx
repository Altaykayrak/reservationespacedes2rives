import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type HolidayPeriod = Tables<"available_holiday_periods">;

interface ExcludedDatesManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayPeriod;
  onSuccess?: () => void;
}

interface ExcludedDate {
  dateStr: string;
  date: Date;
  reason: string;
  closedPeriodId?: string;
}

const ExcludedDatesManager = ({ open, onOpenChange, holiday, onSuccess }: ExcludedDatesManagerProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [excludedDates, setExcludedDates] = useState<Map<string, ExcludedDate>>(new Map());
  const [reasons, setReasons] = useState<Map<string, string>>(new Map());

  // Generate workdays for the period
  const getWorkdays = (): Date[] => {
    const start = new Date(holiday.start_date);
    const end = new Date(holiday.end_date);
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Load existing closed_periods that overlap with this holiday
  useEffect(() => {
    if (!open) return;
    const fetchClosedPeriods = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("closed_periods")
          .select("*")
          .lte("start_date", holiday.end_date)
          .gte("end_date", holiday.start_date);

        if (error) throw error;

        const map = new Map<string, ExcludedDate>();
        const reasonsMap = new Map<string, string>();
        
        if (data) {
          for (const cp of data) {
            const cpStart = new Date(cp.start_date);
            const cpEnd = new Date(cp.end_date);
            const current = new Date(cpStart);
            while (current <= cpEnd) {
              const dateStr = format(current, "yyyy-MM-dd");
              map.set(dateStr, {
                dateStr,
                date: new Date(current),
                reason: cp.reason,
                closedPeriodId: cp.id,
              });
              reasonsMap.set(dateStr, cp.reason);
              current.setDate(current.getDate() + 1);
            }
          }
        }
        setExcludedDates(map);
        setReasons(reasonsMap);
      } catch (err) {
        console.error("Error fetching closed periods:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClosedPeriods();
  }, [open, holiday]);

  const toggleDate = (dateStr: string, date: Date) => {
    const newMap = new Map(excludedDates);
    if (newMap.has(dateStr)) {
      newMap.delete(dateStr);
    } else {
      newMap.set(dateStr, {
        dateStr,
        date,
        reason: reasons.get(dateStr) || "Fermeture exceptionnelle",
      });
    }
    setExcludedDates(newMap);
  };

  const updateReason = (dateStr: string, reason: string) => {
    const newReasons = new Map(reasons);
    newReasons.set(dateStr, reason);
    setReasons(newReasons);
    
    if (excludedDates.has(dateStr)) {
      const newMap = new Map(excludedDates);
      const entry = newMap.get(dateStr)!;
      newMap.set(dateStr, { ...entry, reason });
      setExcludedDates(newMap);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Delete existing closed_periods that fall within this holiday period
      const { error: deleteError } = await supabase
        .from("closed_periods")
        .delete()
        .lte("start_date", holiday.end_date)
        .gte("end_date", holiday.start_date);

      if (deleteError) throw deleteError;

      // Insert new excluded dates (each as a single-day closed_period)
      if (excludedDates.size > 0) {
        const inserts = Array.from(excludedDates.values()).map(ed => ({
          start_date: ed.dateStr,
          end_date: ed.dateStr,
          reason: reasons.get(ed.dateStr) || ed.reason || "Fermeture exceptionnelle",
        }));

        const { error: insertError } = await supabase
          .from("closed_periods")
          .insert(inserts);

        if (insertError) throw insertError;
      }

      toast({ title: "Succès", description: "Jours exclus mis à jour avec succès." });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error saving excluded dates:", err);
      toast({
        title: "Erreur",
        description: err.message || "Impossible de sauvegarder les jours exclus.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const workdays = getWorkdays();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Jours exclus — {holiday.name}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Cochez les jours à exclure de la réservation (jours fériés, fermetures exceptionnelles).
          Ces jours ne seront pas comptés dans le minimum de 3 jours par semaine.
        </p>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {workdays.map(date => {
              const dateStr = format(date, "yyyy-MM-dd");
              const isExcluded = excludedDates.has(dateStr);
              const label = format(date, "EEEE d MMMM yyyy", { locale: fr });

              return (
                <div key={dateStr} className="flex items-center gap-3 p-2 rounded border">
                  <Checkbox
                    id={`exclude-${dateStr}`}
                    checked={isExcluded}
                    onCheckedChange={() => toggleDate(dateStr, date)}
                  />
                  <Label
                    htmlFor={`exclude-${dateStr}`}
                    className={`flex-1 capitalize cursor-pointer ${isExcluded ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {label}
                  </Label>
                  {isExcluded && (
                    <Input
                      className="w-48 text-xs"
                      placeholder="Motif"
                      value={reasons.get(dateStr) || ""}
                      onChange={e => updateReason(dateStr, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExcludedDatesManager;