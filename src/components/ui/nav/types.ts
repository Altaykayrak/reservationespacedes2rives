
import { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  requiresAuth?: boolean;
}

export interface NavProps {
  menuItems: NavItem[];
  isAuthenticated: boolean;
  onLogout: () => void;
}
