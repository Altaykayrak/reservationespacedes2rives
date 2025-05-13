
// Re-export from sonner to maintain API compatibility
import { toast } from "sonner";

// Define a custom toast interface that explicitly includes the error method
interface CustomToast {
  (props: any): { id: string; dismiss: () => void; update: (props: any) => void };
  error: (message: string, options?: any) => { id: string; dismiss: () => void; update: (props: any) => void };
  success: (message: string, options?: any) => { id: string; dismiss: () => void; update: (props: any) => void };
  info: (message: string, options?: any) => { id: string; dismiss: () => void; update: (props: any) => void };
  warning: (message: string, options?: any) => { id: string; dismiss: () => void; update: (props: any) => void };
}

// Cast the toast to our custom interface to ensure TypeScript recognizes the error method
export const customToast = toast as CustomToast;
export { toast };

// Also export the useToast hook from shadcn/ui for compatibility
export { useToast } from "@/components/ui/use-toast";
