
export interface NavItem {
  label: string;
  href: string;
}

export interface NavProps {
  menuItems: NavItem[];
  isAuthenticated: boolean;
  onLogout: () => void;
}
