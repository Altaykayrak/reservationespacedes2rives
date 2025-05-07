
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SchoolClassCategories from "@/components/admin/SchoolClassCategories";
import AddHolidayPeriodForm from "@/components/admin/holidays/AddHolidayPeriodForm";
import HolidayPeriodsList from "@/components/admin/holidays/HolidayPeriodsList";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";

const AdminHolidays = () => {
  const { data: holidays, refetch, isLoading, error } = useQuery({
    queryKey: ["available_holiday_periods"],
    queryFn: async () => {
      console.log("Fetching available holiday periods...");
      const { data, error } = await supabase
        .from("available_holiday_periods")
        .select("*")
        .order('start_date', { ascending: false });
        
      if (error) {
        console.error("Error fetching holiday periods:", error);
        throw error;
      }
      
      console.log("Fetched holiday periods:", data);
      return data;
    },
  });

  const handleHolidayAdded = async () => {
    console.log("Holiday added, refetching...");
    await refetch();
  };

  if (error) {
    console.error("Error in AdminHolidays:", error);
  }

  return (
    <div>
      <AdminNavbar />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour à l'administration
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Gestion des vacances</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <AddHolidayPeriodForm onSuccess={handleHolidayAdded} />
          </ErrorBoundary>
          
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <SchoolClassCategories />
          </ErrorBoundary>
          
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {isLoading ? (
              <div className="p-6 bg-white rounded-lg shadow flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <HolidayPeriodsList holidays={holidays || []} onDelete={handleHolidayAdded} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default AdminHolidays;
