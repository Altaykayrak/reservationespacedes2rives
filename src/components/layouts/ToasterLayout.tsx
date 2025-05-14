
import { Toaster } from "sonner";

interface ToasterLayoutProps {
  children: React.ReactNode;
}

export const ToasterLayout = ({ children }: ToasterLayoutProps) => {
  return (
    <>
      {children}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontSize: '14px',
          },
          duration: 5000,
        }}
      />
    </>
  );
};
