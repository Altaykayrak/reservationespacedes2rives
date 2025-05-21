// src/components/reservations/TeenHolidayReservationsList.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

interface ChildData {
  id: string;
  first_name: string;
  last_name: string;
}

interface HolidayReservationWithChild
  extends Omit<Tables<"holiday_reservations_with_children">, "children"> {
  children: ChildData;
}

export function TeenHolidayReservationsList({ periodId }: { periodId: string }) {
  const { data: list = [], isLoading } = useQuery<HolidayReservationWithChild[]>({
    queryKey: ["holiday_reservations_list", periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_reservations_with_children")
        .select(`
          *,
          children ( id, first_name, last_name )
        `)
        .eq("period_id", periodId)
        .eq("status", "confirmed")
        .order("reservation_date", { ascending: true });

      if (error) throw error;
      return data as HolidayReservationWithChild[];
    },
    enabled: Boolean(periodId),
    staleTime: 30_000, // tu peux ajuster la durée de cache si tu veux
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (list.length === 0) {
    return <p>Aucune réservation Club Ado pour cette période.</p>;
  }

  return (
    <ul className="space-y-2">
      {list.map((r) => (
        <li key={r.id} className="p-2 border rounded">
          {r.children.first_name} {r.children.last_name} — {r.reservation_date}
        </li>
      ))}
    </ul>
  );
}
