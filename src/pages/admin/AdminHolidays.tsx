import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SchoolClassCategories from "@/components/admin/SchoolClassCategories";
import AddHolidayPeriodForm from "@/components/admin/holidays/AddHolidayPeriodForm";
import HolidayPeriodsList from "@/components/admin/holidays/HolidayPeriodsList";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";

const AdminHolidays = () => {
  const { data: holidays, refetch } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button asChild variant="outline">
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'administration
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Gestion des vacances</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AddHolidayPeriodForm onSuccess={refetch} />
          <SchoolClassCategories />
          <HolidayPeriodsList holidays={holidays || []} onDelete={refetch} />
        </div>
      </div>
    </div>
  );
};

export default AdminHolidays;