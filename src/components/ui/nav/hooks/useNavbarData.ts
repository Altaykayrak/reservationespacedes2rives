
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Home, User, Baby, Calendar, Palmtree, Users, FileText, Euro, CalendarDays } from "lucide-react";
import { NavItem } from "../types";

export const useNavbarData = () => {
  const { user, signOut } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  // All menu items with authentication requirements
  const allMenuItems: NavItem[] = [
    {
      label: "Accueil",
      href: "/",
      icon: Home,
      requiresAuth: false
    },
    {
      label: "Profil",
      href: "/profile",
      icon: User,
      requiresAuth: true
    },
    {
      label: "Mes enfants",
      href: "/children",
      icon: Baby,
      requiresAuth: true
    },
    {
      label: "Mercredis",
      href: "/wednesday-reservations",
      icon: Calendar,
      requiresAuth: true
    },
    {
      label: "Vacances",
      href: "/holiday-reservations",
      icon: Palmtree,
      requiresAuth: true
    },
    {
      label: "Club Ado",
      href: "/teenholiday-reservations",
      icon: Users,
      requiresAuth: true
    },
    {
      label: "Programme vacances",
      href: "/holiday-program",
      icon: FileText,
      requiresAuth: false
    },
    // {
    //   label: "Programme Festival",
    //   href: "/festival-program",
    //   icon: FileText,
    //   requiresAuth: false
    // },
    {
      label: "Inscription 2026-2027",
      href: "/rdv",
      icon: CalendarDays,
      requiresAuth: true
    },
    {
      label: "Règlement",
      href: "/terms-of-operation",
      icon: FileText,
      requiresAuth: false
    },
    {
      label: "CGU",
      href: "/terms-of-service",
      icon: FileText,
      requiresAuth: false
    },
    {
      label: "Tarifs",
      href: "/prices",
      icon: Euro,
      requiresAuth: false
    }
  ];

  // Filter menu items based on authentication status
  const menuItems = allMenuItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  return {
    user,
    isAuthenticated,
    menuItems,
    handleLogout
  };
};
