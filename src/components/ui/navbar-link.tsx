
import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavbarLinkProps extends LinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const NavbarLink = ({ to, children, className, ...props }: NavbarLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive
          ? "text-primary font-semibold"
          : "text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};
