
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { NavItem } from "./types";

interface ProfileDropdownProps {
  user: any;
  menuItems: NavItem[];
  onLogout: () => void;
}

export const ProfileDropdown = ({ user, menuItems, onLogout }: ProfileDropdownProps) => {
  // Récupérer le prénom et le nom depuis user_metadata, ou fallback sur email
  const firstName = user?.user_metadata?.first_name || user?.user_metadata?.firstName || "";
  const lastName = user?.user_metadata?.last_name || user?.user_metadata?.lastName || "";
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : user?.email;
  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : user?.email?.[0].toUpperCase() || "?";

  return (
    <Sheet>
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
            {menuItems.map(item => (
              <Link key={item.label} to={item.href} className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Button variant="destructive" className="w-full" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </Button>
      </SheetContent>
    </Sheet>
  );
};
