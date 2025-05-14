
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/forms/LoginForm";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rediriger simplement vers /admin sans vérification
    navigate("/admin", { replace: true });
  };

  return (
    <AuthLayout title="Administration" description="Connectez-vous à l'interface d'administration">
      <div className="text-center mb-4">
        <button 
          onClick={() => navigate("/admin")} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Accéder directement à l'administration
        </button>
      </div>
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
};

export default AdminLoginPage;
