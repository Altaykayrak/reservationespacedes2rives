
// Re-export from sonner to maintain API compatibility
import { toast } from "sonner";

export { toast };

// Also export the useToast hook from shadcn/ui for compatibility
export { useToast } from "@/components/ui/use-toast";
