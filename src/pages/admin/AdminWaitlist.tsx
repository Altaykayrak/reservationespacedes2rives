import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { X, CheckCircle2 } from "lucide-react";
import { useAdminChildrenData } from "@/hooks/useAdminChildrenData";
import { AdminChildSelector } from "@/components/admin/reservations/AdminChildSelector";
import { PeriodSelector } from "@/components/reservations/PeriodSelector";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";
import { Checkbox } from "@/components/ui/checkbox";
import { useHolidaySpots } from "@/hooks/useHolidaySpots";

type Category = { id: string; name: string; category: string };
type Child = { id: string; first_name: string; last_name: string };
type WaitlistRow = {
  id: string;
  child_id: string;
  date: string;
  school_class_category_id: string;
  status: "waiting" | "notified";
  notified_at: string | null;
  created_at: string;
  without_meal: boolean;
  early_dropoff: boolean;
  children: Child | null;
  school_class_categories: Category | null;
};

const AdminWaitlist = () => {
  const qc = useQueryClient();
  const [childId, setChildId] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<Record<string, { withoutMeal: boolean; earlyDropoff: boolean }>>({});
  const { holidayPeriods } = useHolidayPeriods();

  const periodDates = useMemo(() => {
    const period = holidayPeriods?.find((p) => p.id === selectedPeriod);
    if (!period) return [];
    return eachDayOfInterval({
      start: new Date(period.start_date),
      end: new Date(period.end_date),
    }).filter((d) => d.getDay() !== 0 && d.getDay() !== 6);
  }, [holidayPeriods, selectedPeriod]);

  const { data: categories = [] } = useQuery({
    queryKey: ["waitlist-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_class_categories")
        .select("id, name, category")
        .order("category");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { allChildren } = useAdminChildrenData();

  const { data: periodMappings = [] } = useQuery({
    queryKey: ["period-mappings", selectedPeriod],
    enabled: !!selectedPeriod,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_period_class_mappings")
        .select("category, school_class")
        .eq("holiday_period_id", selectedPeriod);
      if (error) throw error;
      return data as { category: string; school_class: string }[];
    },
  });

  const ALL_GROUPS: { value: string; label: string }[] = [
    { value: "maternelle", label: "Maternelle" },
    { value: "primaire", label: "Primaire" },
    { value: "adolescent", label: "Adolescent" },
  ];

  const availableGroups = useMemo(() => {
    const set = new Set(periodMappings.map((m) => m.category.toLowerCase()));
    return ALL_GROUPS.filter((g) => set.has(g.value));
  }, [periodMappings]);

  const selectedChild = useMemo(
    () => allChildren?.find((c) => c.id === childId),
    [allChildren, childId]
  );

  const categoryId = useMemo(() => {
    if (!selectedChild) return "";
    const normalized = normalizeSchoolClass(selectedChild.school_class);
    const match = categories.find(
      (c) => c.name.toUpperCase() === normalized.toUpperCase()
    );
    return match?.id ?? "";
  }, [selectedChild, categories]);

  const filteredChildren = useMemo(() => {
    if (!allChildren || !selectedPeriod || !selectedGroup) return [];
    const allowed = new Set(
      periodMappings
        .filter((m) => m.category.toLowerCase() === selectedGroup)
        .map((m) => m.school_class.toUpperCase())
    );
    return allChildren.filter((c) => allowed.has(c.school_class.toUpperCase()));
  }, [allChildren, selectedGroup, selectedPeriod, periodMappings]);

  const { data: rows = [], refetch } = useQuery({
    queryKey: ["waitlist", filterDate, filterCategory],
    queryFn: async () => {
      let q = supabase
        .from("waitlist")
        .select("*, children(id, first_name, last_name), school_class_categories(id, name, category)")
        .is("deleted_at", null)
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });
      if (filterDate) q = q.eq("date", filterDate);
      if (filterCategory !== "all") q = q.eq("school_class_category_id", filterCategory);
      const { data, error } = await q;
      if (error) throw error;
      return data as WaitlistRow[];
    },
  });

  // Realtime: listen for waitlist changes (notified status)
  useEffect(() => {
    const channel = supabase
      .channel("waitlist-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waitlist" },
        () => {
          qc.invalidateQueries({ queryKey: ["waitlist"] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const handleAdd = async () => {
    const dates = Object.keys(selectedDates);
    if (!childId || dates.length === 0 || !categoryId) {
      toast.error("Enfant et au moins une date requis (catégorie introuvable pour cette classe)");
      return;
    }
    const rows = dates.map((d) => ({
      child_id: childId,
      date: d,
      school_class_category_id: categoryId,
      without_meal: selectedDates[d].withoutMeal,
      early_dropoff: selectedDates[d].earlyDropoff,
    }));
    const { error } = await supabase.from("waitlist").insert(rows as any);
    if (error) {
      if (error.code === "23505") {
        toast.error("Cet enfant est déjà en liste d'attente pour l'une de ces dates");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(`${dates.length} date(s) ajoutée(s) à la liste d'attente`);
    setChildId("");
    setSelectedDates({});
    setSelectedPeriod("");
    refetch();
  };

  const handleSoftDelete = async (id: string) => {
    const { error } = await supabase
      .from("waitlist")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Retiré de la liste d'attente");
    refetch();
  };

  const handleAssign = async (id: string) => {
    await handleSoftDelete(id);
    setDismissed((s) => new Set(s).add(id));
  };

  const handleIgnore = (id: string) => {
    setDismissed((s) => new Set(s).add(id));
    // Note: per spec, "Ignorer" should reset status — but RLS forbids that from frontend.
    // The banner is just dismissed locally; the row stays "notified".
  };

  const notifiedRows = rows.filter((r) => r.status === "notified" && !dismissed.has(r.id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Liste d'attente</h1>

      {notifiedRows.map((r) => (
        <Card key={r.id} className="p-4 border-green-500 border-2 bg-green-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-semibold text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Une place s'est libérée le {new Date(r.date).toLocaleDateString("fr-FR")} en {r.school_class_categories?.category}
              </div>
              <p className="mt-1 text-sm">
                L'enfant suivant peut être inscrit pour ce jour :{" "}
                <strong>{r.children?.first_name} {r.children?.last_name}</strong>
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleAssign(r.id)}>Attribuer la place</Button>
              <Button size="sm" variant="outline" onClick={() => handleIgnore(r.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Ajouter un enfant à la liste d'attente</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={(id) => {
                  setSelectedPeriod(id);
                  setSelectedGroup("");
                  setChildId("");
                  setSelectedDates({});
                }}
                holidayPeriods={holidayPeriods}
              />
            </div>
          </div>
          {selectedPeriod && (
            <div className="space-y-2">
              <Label>Sélectionner un groupe</Label>
              <Select
                value={selectedGroup}
                onValueChange={(v) => {
                  setSelectedGroup(v);
                  setChildId("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un groupe" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Aucun groupe configuré pour cette période
                    </div>
                  ) : (
                    availableGroups.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedPeriod && selectedGroup && (
            <AdminChildSelector
              selectedChild={childId}
              setSelectedChild={setChildId}
              children={filteredChildren}
            />
          )}
          {selectedChild && (
            <p className="text-sm text-muted-foreground">
              Catégorie détectée :{" "}
              {categoryId ? (
                <strong>
                  {categories.find((c) => c.id === categoryId)?.category} —{" "}
                  {categories.find((c) => c.id === categoryId)?.name}
                </strong>
              ) : (
                <span className="text-destructive">
                  Aucune catégorie trouvée pour la classe « {selectedChild.school_class} »
                </span>
              )}
            </p>
          )}
          {selectedChild && selectedPeriod && categoryId && (
            <div className="space-y-2">
              <Label>Dates complètes (0 place restante)</Label>
              <div className="space-y-2 rounded-md border p-3">
                {periodDates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune date dans cette période.</p>
                ) : (
                  periodDates.map((d) => (
                    <FullDateRow
                      key={d.toISOString()}
                      date={d}
                      periodId={selectedPeriod}
                      schoolClass={selectedChild.school_class}
                      selected={selectedDates}
                      setSelected={setSelectedDates}
                    />
                  ))
                )}
                {periodDates.length > 0 && (
                  <EmptyHint
                    selectedCount={Object.keys(selectedDates).length}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <Button className="mt-4" onClick={handleAdd}>Ajouter à la liste d'attente</Button>
      </Card>

      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <h2 className="text-xl font-semibold mr-auto">Liste d'attente actuelle</h2>
          <div>
            <Label>Filtrer par date</Label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div>
            <Label>Filtrer par catégorie</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.category} — {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => { setFilterDate(""); setFilterCategory("all"); }}>
            Réinitialiser
          </Button>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">Aucun enfant en liste d'attente</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enfant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Ajouté le</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.children?.first_name} {r.children?.last_name}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{r.school_class_categories?.category} — {r.school_class_categories?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.without_meal && <Badge variant="outline">Sans repas</Badge>}
                      {r.early_dropoff && <Badge variant="outline">Accueil avant 8h30</Badge>}
                      {!r.without_meal && !r.early_dropoff && (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleSoftDelete(r.id)}>
                      Retirer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default AdminWaitlist;

interface FullDateRowProps {
  date: Date;
  periodId: string;
  schoolClass: string;
  selected: Record<string, { withoutMeal: boolean; earlyDropoff: boolean }>;
  setSelected: React.Dispatch<
    React.SetStateAction<Record<string, { withoutMeal: boolean; earlyDropoff: boolean }>>
  >;
}

const FullDateRow = ({ date, periodId, schoolClass, selected, setSelected }: FullDateRowProps) => {
  // Use a UTC-noon date so the hook's toISOString() yields the correct calendar day
  const utcDate = useMemo(
    () => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12)),
    [date]
  );
  const { isFull, isLoading } = useHolidaySpots(periodId, utcDate, schoolClass);
  const key = format(date, "yyyy-MM-dd");
  if (isLoading || !isFull) return null;
  const isChecked = !!selected[key];
  const opts = selected[key] ?? { withoutMeal: false, earlyDropoff: false };

  const toggle = () => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { withoutMeal: false, earlyDropoff: false };
      return next;
    });
  };

  const setOpt = (opt: "withoutMeal" | "earlyDropoff", val: boolean) => {
    setSelected((prev) => ({ ...prev, [key]: { ...prev[key], [opt]: val } }));
  };

  return (
    <div className="border-b last:border-0 pb-2 last:pb-0">
      <div className="flex items-center gap-3">
        <Checkbox checked={isChecked} onCheckedChange={toggle} id={`d-${key}`} />
        <Label htmlFor={`d-${key}`} className="cursor-pointer">
          {format(date, "EEEE d MMMM yyyy", { locale: fr })}
        </Label>
        <span className="text-xs text-red-600 ml-auto">Complet</span>
      </div>
      {isChecked && (
        <div className="ml-7 mt-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={opts.withoutMeal}
              onCheckedChange={(v) => setOpt("withoutMeal", !!v)}
            />
            Sans repas
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={opts.earlyDropoff}
              onCheckedChange={(v) => setOpt("earlyDropoff", !!v)}
            />
            Accueil avant 8h30
          </label>
        </div>
      )}
    </div>
  );
};

const EmptyHint = ({ selectedCount }: { selectedCount: number }) => {
  if (selectedCount > 0) return null;
  return (
    <p className="text-xs text-muted-foreground pt-1">
      Seules les dates complètes (0 place restante) sont affichées.
    </p>
  );
};