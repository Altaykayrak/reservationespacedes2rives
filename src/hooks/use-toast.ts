
// Re-export from the UI component to maintain API compatibility
// This avoids circular dependencies
export { toast } from "sonner";

// Add compatibility for internal toast components
interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = {
    // Standard toast function (API compatible with shadcn/ui)
    toast: ({ title, description, variant }: ToastProps) => {
      if (variant === "destructive") {
        return import("sonner").then(mod => 
          mod.toast.error(title, { description })
        );
      }
      return import("sonner").then(mod => 
        mod.toast(title, { description })
      );
    }
  };

  return toast;
};
