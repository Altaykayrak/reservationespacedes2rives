
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
    <div className="sticky top-0 z-50 px-3 pt-3">
      <div className="glass shadow-soft rounded-2xl flex h-14 items-center px-4">
        <div className="ml-auto flex items-center space-x-3">
          <DesktopNav {...navProps} />
          <MobileNav {...navProps} />
          {isAuthenticated && (
            <div className="hidden md:block">
              <ProfileDropdown user={user} menuItems={menuItems} onLogout={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Navbar };
