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
import { AdminGroupSelector } from "@/components/admin/reservations/AdminGroupSelector";
import { AdminChildSelector } from "@/components/admin/reservations/AdminChildSelector";
import { PeriodSelector } from "@/components/reservations/PeriodSelector";
import { useHolidayPeriods } from "@/hooks/useHolidayPeriods";
import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { normalizeSchoolClass } from "@/utils/schoolClassUtils";

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
  children: Child | null;
  school_class_categories: Category | null;
};

const AdminWaitlist = () => {
  const qc = useQueryClient();
  const [childId, setChildId] = useState("");
  const [date, setDate] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
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
    if (!allChildren) return [];
    if (selectedGroup === "all") return allChildren;
    if (selectedGroup === "maternelle") {
      return allChildren.filter((c) =>
        ["PS", "MS", "GS"].some((cls) => c.school_class.toUpperCase().includes(cls))
      );
    }
    if (selectedGroup === "primaire") {
      return allChildren.filter((c) =>
        ["CP", "CE1", "CE2", "CM1", "CM2"].some((cls) => c.school_class.toUpperCase().includes(cls))
      );
    }
    return allChildren;
  }, [allChildren, selectedGroup]);

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
    if (!childId || !date || !categoryId) {
      toast.error("Enfant et date requis (catégorie introuvable pour cette classe)");
      return;
    }
    const { error } = await supabase.from("waitlist").insert({
      child_id: childId,
      date,
      school_class_category_id: categoryId,
    });
    if (error) {
      if (error.code === "23505") {
        toast.error("Cet enfant est déjà en liste d'attente pour ce jour");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Ajouté à la liste d'attente");
    setChildId("");
    setDate("");
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
          <AdminGroupSelector
            selectedGroup={selectedGroup}
            onGroupChange={setSelectedGroup}
            onChildReset={() => setChildId("")}
          />
          <AdminChildSelector
            selectedChild={childId}
            setSelectedChild={setChildId}
            children={filteredChildren}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <PeriodSelector
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={(id) => {
                  setSelectedPeriod(id);
                  setDate("");
                }}
                holidayPeriods={holidayPeriods}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Select value={date} onValueChange={setDate} disabled={!selectedPeriod}>
                <SelectTrigger><SelectValue placeholder="Choisir une date" /></SelectTrigger>
                <SelectContent>
                  {periodDates.map((d) => {
                    const v = format(d, "yyyy-MM-dd");
                    return (
                      <SelectItem key={v} value={v}>
                        {format(d, "EEEE d MMMM yyyy", { locale: fr })}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                <TableHead>Ajouté le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.children?.first_name} {r.children?.last_name}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>{r.school_class_categories?.category} — {r.school_class_categories?.name}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    {r.status === "notified" ? (
                      <Badge className="bg-green-600">Place disponible 🟢</Badge>
                    ) : (
                      <Badge variant="secondary">En attente</Badge>
                    )}
                  </TableCell>
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