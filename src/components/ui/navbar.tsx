
import { DesktopNav } from "./nav/DesktopNav";
import { MobileNav } from "./nav/MobileNav";
import { ProfileDropdown } from "./nav/ProfileDropdown";
import { useNavbarData } from "./nav/hooks/useNavbarData";
import { NavProps } from "./nav/types";

const Navbar = () => {
  const { user, isAuthenticated, menuItems, handleLogout } = useNavbarData();
  
  const navProps: NavProps = {
    menuItems: menuItems,
    isAuthenticated: isAuthenticated,
    onLogout: handleLogout
  };
  
  return (
    <div className="border-b bg-background sticky top-0 z-50">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <DesktopNav {...navProps} />
          <MobileNav {...navProps} />
          {isAuthenticated && (
            <div className="hidden md:block">
              <ProfileDropdown user={user} menuItems={menuItems} onLogout={handleLogout} />
            </div>
          )}
          {/* Suppression du bouton "Se connecter" sur desktop */}
        </div>
      </div>
    </div>
  );
};

export { Navbar };
