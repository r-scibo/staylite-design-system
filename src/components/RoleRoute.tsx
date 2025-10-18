import { Navigate } from "react-router-dom";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "./LoadingSpinner";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleRoute = ({ children, allowedRole }: RoleRouteProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
