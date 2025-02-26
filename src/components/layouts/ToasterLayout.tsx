
import { Toaster } from "sonner";
import React from 'react';

interface ToasterLayoutProps {
  children: React.ReactNode;
}

export const ToasterLayout = ({ children }: ToasterLayoutProps) => {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
};
