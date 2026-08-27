import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../utils/auth";

interface RoleRouteProps {
  allowedRoles: readonly UserRole[];
  children?: ReactNode;
  unauthorizedTo?: string;
}

export default function RoleRoute({
  allowedRoles,
  children,
  unauthorizedTo = "/dashboard",
}: RoleRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={unauthorizedTo} replace />;
  }

  return children ?? <Outlet />;
}
