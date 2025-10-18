import { useNavigate } from "react-router-dom";
import { useUserRole, UserRole } from "@/hooks/useUserRole";
import { LoadingSpinner } from "./LoadingSpinner";
import { AccessDeniedHostOnly } from "./AccessDeniedHostOnly";
import { Button } from "./ui/button";
import { ShieldAlert } from "lucide-react";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleRoute = ({ children, allowedRole }: RoleRouteProps) => {
  const { role, loading } = useUserRole();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Special handling for Guest trying to access Host area
  if (allowedRole === "Host" && role === "Guest") {
    return <AccessDeniedHostOnly />;
  }

  // User is authenticated (via ProtectedRoute) but has wrong role - show generic access denied
  if (role !== null && role !== allowedRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <div className="mb-4 inline-flex rounded-full bg-destructive/10 p-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Access Denied
          </h1>
          <p className="mb-6 text-muted">
            You don't have permission to access this page. Host privileges are required.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
