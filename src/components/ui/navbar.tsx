
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../admin/reservations/hooks/useAdminAuth";
import { NavbarLink } from "./navbar-link";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";
import { Menu } from "lucide-react";

export const Navbar = () => {
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  
  const isLoggedIn = !!user;

  return (
    <div className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold">Les Petits Artistes</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <NavbarLink to="/teenholiday-reservations">Ados</NavbarLink>
                <NavbarLink to="/profile">Mon compte</NavbarLink>
                {isAdmin && (
                  <NavbarLink to="/admin">Admin</NavbarLink>
                )}
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:w-64">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Explorez les différentes sections de notre site.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="divide-y divide-border">
                    <div className="grid gap-4 py-4">
                      <NavbarLink to="/teenholiday-reservations">Ados</NavbarLink>
                      <NavbarLink to="/profile">Mon compte</NavbarLink>
                      {isAdmin && (
                        <NavbarLink to="/admin">Admin</NavbarLink>
                      )}
                    </div>
                    <div className="grid gap-4 py-4">
                      <Button variant="outline" onClick={signOut} className="w-full">
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url as string} />
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <NavbarLink to="/login">Se connecter</NavbarLink>
              <Button variant="outline" onClick={() => navigate("/register")}>
                S'inscrire
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
