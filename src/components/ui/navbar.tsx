
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { NavItem, NavProps } from "./nav/types";
import { Logo } from "./nav/Logo";
import { MobileNav } from "./nav/MobileNav";
import { DesktopNav } from "./nav/DesktopNav";
import { useGlobalSettings } from "@/hooks/useGlobalSettings";

const Navbar = () => {
  const {
    user,
    signOut
  } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileData, setProfileData] = useState<{
    first_name: string | null;
    last_name: string | null;
  } | null>(null);
  const { settings, loading: settingsLoading } = useGlobalSettings();

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  // Base menu items
  let baseMenuItems: NavItem[] = [{
    label: "Accueil",
    href: "/"
  }, {
    label: "Profil",
    href: "/profile"
  }, {
    label: "Mes enfants",
    href: "/children"
  }];
  
  // Add Wednesday reservations if not hidden for this user
  if (!settingsLoading && !settings.hide_wednesday_reservations) {
    baseMenuItems.push({
      label: "Mercredis",
      href: "/wednesday-reservations"
    });
  }
  
  // Add other regular items
  const additionalMenuItems: NavItem[] = [{
    label: "Vacances",
    href: "/holiday-reservations"
  }, {
    label: "Club Ado",
    href: "/teenholiday-reservations"
  }, {
    label: "Programme vacances",
    href: "/holiday-program"
  }];
  
  baseMenuItems = [...baseMenuItems, ...additionalMenuItems];
  
  // Add RDV if not hidden for this user
  if (!settingsLoading && !settings.hide_rdv_page) {
    baseMenuItems.push({
      label: "Inscription 2025-2026",
      href: "/rdv"
    });
  }
  
  // Add remaining items
  const finalMenuItems: NavItem[] = [...baseMenuItems, {
    label: "Règlement",
    href: "/terms-of-operation"
  }, {
    label: "Tarifs",
    href: "/prices"
  }];
  
  const menuItems = finalMenuItems;
  
  const navProps: NavProps = {
    menuItems: menuItems,
    isAuthenticated: isAuthenticated,
    onLogout: handleLogout
  };
  
  return <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-4">
        <Logo />
        <div className="ml-auto flex items-center space-x-4">
          <DesktopNav {...navProps} />
          <MobileNav {...navProps} />
          {isAuthenticated ? <ProfileDropdown user={user} menuItems={menuItems} onLogout={handleLogout} /> : <Link to="/login">
              <Button variant="default" size="sm">
                Se connecter
              </Button>
            </Link>}
        </div>
      </div>
    </div>;
};

interface NavigationMenuProps extends NavProps {}

const NavigationMenu = ({
  menuItems,
  isAuthenticated,
  onLogout
}: NavigationMenuProps) => {
  return <div className="hidden md:flex items-center space-x-4">
      {menuItems.map(item => <Link key={item.label} to={item.href} className="text-sm font-medium transition-colors hover:text-primary">
          {item.label}
        </Link>)}
      {isAuthenticated && <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>}
    </div>;
};

interface ProfileDropdownProps {
  user: any;
  menuItems: NavItem[];
  onLogout: () => void;
}

const ProfileDropdown = ({
  user,
  menuItems,
  onLogout
}: ProfileDropdownProps) => {
  // Récupérer le prénom et le nom depuis user_metadata, ou fallback sur email
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.firstName || "";
  const lastName = user?.user_metadata?.last_name || user?.user_metadata?.lastName || "";
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : user?.email;
  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || "?";

  return <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>E2R Réservation</SheetTitle>
          <SheetDescription>
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{fullName}</div>
              <div className="text-muted-foreground text-sm">{user?.email}</div>
            </div>
          </div>
          
          <div className="grid gap-2">
            {menuItems.map(item => <Link key={item.label} to={item.href} className="text-sm font-medium transition-colors hover:text-primary">
                {item.label}
              </Link>)}
          </div>
          
          <Link to="/profile">
            
          </Link>
          <Link to="/children">
            
          </Link>
        </div>
        <Button variant="destructive" className="w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </SheetContent>
    </Sheet>;
};

export { Navbar };
