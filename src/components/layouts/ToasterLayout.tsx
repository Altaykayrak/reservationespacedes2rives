
import { Toaster as SonnerToaster } from "sonner";

interface ToasterLayoutProps {
  children: React.ReactNode;
}

export const ToasterLayout = ({ children }: ToasterLayoutProps) => {
  return (
    <>
      {children}
      <SonnerToaster 
        position="top-center" 
        richColors 
        closeButton 
        expand={false}
        toastOptions={{
          duration: 5000,
          className: "toast-container"
        }}
      />
    </>
  );
};
