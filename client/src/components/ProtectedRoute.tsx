import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Check Authentication
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Authorization for Admin
  if (requireAdmin && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
