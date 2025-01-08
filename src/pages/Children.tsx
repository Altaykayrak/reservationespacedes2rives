import { ChildrenList } from "@/components/profile/ChildrenList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Child } from "@/types/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";

const Children = () => {
  const navigate = useNavigate();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ["children"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("profile_id", user.id);
        
      if (error) {
        console.error("Error fetching children:", error);
        throw error;
      }
      return data as Child[];
    },
  });

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <AlertDescription>
              Une erreur est survenue lors du chargement des données. Veuillez réessayer ou vous reconnecter.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => navigate("/login")}>
              Se reconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <ChildrenList children={children} />
      </div>
    </div>
  );
};

export default Children;