// src/components/reservations/HolidayReservationsList.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Loader2 } from "lucide-react";

interface HolidayReservationWithChild extends Tables<"holiday_reservations_with_children"> {}

export function HolidayReservationsList({ periodId }: { periodId: string }) {
  const { data: list = [], isLoading } = useQuery<HolidayReservationWithChild[]>({
    queryKey: ["holiday_reservations_list", periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("holiday_reservations_with_children")
        .select("*")
        .eq("period_id", periodId)
        .eq("status", "confirmed")
        .order("reservation_date", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (list.length === 0) {
    return <p>Aucune réservation pour cette période.</p>;
  }

  return (
    <ul className="space-y-2">
      {list.map(r => (
        <li key={r.id} className="p-2 border rounded">
          {r.children.first_name} {r.children.last_name} — {r.reservation_date}
        </li>
      ))}
    </ul>
  );
}
