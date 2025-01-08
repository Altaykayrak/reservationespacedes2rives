import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-start p-4">
      <div 
        className="w-full h-48 bg-cover bg-center mb-8"
        style={{
          backgroundImage: `url('https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Facadee2r.jpg')`
        }}
      />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-600">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};