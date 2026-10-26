import { Navigate } from "react-router";
import { useAuth } from "./AuthProvider";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}