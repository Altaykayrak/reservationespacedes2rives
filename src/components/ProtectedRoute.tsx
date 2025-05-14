
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Plus de redirections automatiques, on laisse simplement passer les enfants
  return <>{children}</>;
}
