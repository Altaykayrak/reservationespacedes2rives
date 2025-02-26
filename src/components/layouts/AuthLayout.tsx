
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  subDescription?: string;
}

export const AuthLayout = ({ children, title, description, subDescription }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-start p-4 md:p-0">
      <div 
        className="w-full h-48 md:h-screen bg-cover bg-center mb-8 md:mb-0 md:fixed md:inset-0 md:z-0"
        style={{
          backgroundImage: `url('https://dddtybmradplydzymrly.supabase.co/storage/v1/object/public/images/Back.jpg')`,
          objectPosition: '0 -300px'
        }}
      />
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 space-y-6 md:relative md:z-10 md:mt-20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
          {subDescription && (
            <p className="text-sm text-gray-500 italic">{subDescription}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
