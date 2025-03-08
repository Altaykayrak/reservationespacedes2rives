import { Navbar } from "@/components/ui/navbar";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { TermsContent } from "@/components/terms/TermsContent";

const TermsOfOperation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  console.log("TermsOfOperation location state:", location.state);
  
  const handleBack = () => {
    // If we have a stored "from" path in the location state, navigate to it
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Otherwise, just go back in history
      navigate(-1);
    }
  };

  // Check if we came from registration page
  const showBackButton = location.state?.from === "/register";
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {showBackButton && (
          <Button onClick={handleBack} variant="outline" className="mb-6 flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour sur l'inscription
          </Button>
        )}

        <TermsContent />
      </div>
    </div>
  );
};

export default TermsOfOperation;
