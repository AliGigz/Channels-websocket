import { jwtDecode } from "jwt-decode";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import { createContext, useContext } from "react";
import api from "../api";

interface AuthContextType {
  currentUserId: number | null;
}

export const AuthContext = createContext<AuthContextType>({
  currentUserId: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface ProtectedRouteTypes {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteTypes) {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const verify = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setIsValid(false);
      return;
    }
    try {
      await api.post("token/verify/", { token });
      const decode = jwtDecode(token);
      const date = Date.now() / 1000;
      if (date > decode.exp) {
        await refreshToken();
      } else setIsValid(true);
      setCurrentUserId(decode.user_id)
    } catch (error) {
      localStorage.removeItem("access");
      setIsValid(false);
    }
  };
  const refreshToken = async () => {
    try {
      const token = localStorage.getItem("refresh");
      await api.post("token/verify/", { token });
      const res = await api.post("token/refresh/", { refresh: token });
      localStorage.setItem("access", res.data.access);
      setIsValid(true);
    } catch (error) {
      setIsValid(false);
    }
  };

  useEffect(() => {
    verify();
  }, []);
  if (isValid === null) {
    return <div>Loading...</div>;
  }
  if (!isValid) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AuthContext.Provider
      value={{
        currentUserId: currentUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
