
import { Toaster } from "sonner";
import React from 'react';

interface ToasterLayoutProps {
  children: React.ReactNode;
}

export const ToasterLayout: React.FC<ToasterLayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
};
