
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddHolidayPeriodForm } from "@/components/admin/holidays/AddHolidayPeriodForm";
import HolidayPeriodsList from "@/components/admin/holidays/HolidayPeriodsList";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const AdminHolidays = () => {
  const { toast } = useToast();
  const { data: isAdmin, isLoading: isAdminLoading } = useAdminAuth();
  
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

  // Vérification explicite du statut admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        console.log("Checking admin status for user:", data.session.user.id);
        const { data: adminCheck, error: adminError } = await supabase
          .rpc('is_admin', { user_id: data.session.user.id });
          
        console.log("Admin check result:", adminCheck);
        
        if (adminError) {
          console.error("Error checking admin status:", adminError);
          toast({
            title: "Erreur d'autorisation",
            description: "Impossible de vérifier les droits d'administration",
            variant: "destructive"
          });
        } else if (!adminCheck) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits d'administration nécessaires",
            variant: "destructive"
          });
        }
      }
    };
    
    checkAdminStatus();
  }, [toast]);

  const handleHolidayAdded = async () => {
    console.log("Holiday added, refetching...");
    await refetch();
  };

  if (error) {
    console.error("Error in AdminHolidays:", error);
  }

  if (isAdminLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-6 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="mt-2">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
          <Button asChild className="mt-4">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
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
  );
};

export default AdminHolidays;
