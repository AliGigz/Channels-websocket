import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import api from "../api";

interface TokenPayload {
  user_id: number;
  exp: number;
}

interface AuthContextType {
  currentUserId: number | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUserId: null,
  isAuthenticated: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        throw new Error("No refresh token");
      }

      const res = await api.post("token/refresh/", {
        refresh,
      });

      const access = res.data.access;

      localStorage.setItem("access", access);

      const decoded: TokenPayload = jwtDecode(access);

      setCurrentUserId(decoded.user_id);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error("Refresh failed:", error);

      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      setCurrentUserId(null);
      setIsAuthenticated(false);

      return false;
    }
  };

  const verifyToken = async () => {
    const access = localStorage.getItem("access");

    if (!access) {
      setLoading(false);
      return;
    }

    try {
      const decoded: TokenPayload = jwtDecode(access);

      const now = Date.now() / 1000;

      if (decoded.exp <= now) {
        await refreshToken();
        setLoading(false);
        return;
      }

      await api.post("token/verify/", {
        token: access,
      });

      setCurrentUserId(decoded.user_id);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Access token invalid:", error);

      await refreshToken();
    }

    setLoading(false);
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUserId,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}