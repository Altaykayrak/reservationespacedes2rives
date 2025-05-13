
// Re-export from sonner to maintain API compatibility
import { toast } from "sonner";

// Define the return type to match what sonner actually returns
type ToastReturnType = string | number;

// Define a custom toast interface that explicitly includes the error method
interface CustomToast {
  (props: any): ToastReturnType;
  error: (message: string, options?: any) => ToastReturnType;
  success: (message: string, options?: any) => ToastReturnType;
  info: (message: string, options?: any) => ToastReturnType;
  warning: (message: string, options?: any) => ToastReturnType;
}

// Cast the toast to our custom interface to ensure TypeScript recognizes the error method
export const customToast = toast as CustomToast;
export { toast };

// Also export the useToast hook from shadcn/ui for compatibility
export { useToast } from "@/components/ui/use-toast";
