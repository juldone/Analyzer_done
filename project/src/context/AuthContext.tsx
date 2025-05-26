import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

axios.defaults.withCredentials = true;

// ----------- Interfaces -----------

interface User {
  id: string;
  username: string;
  email: string;
  twoFactorEnabled: boolean;
  isVerified: boolean;
  twoFactorMethod?: "app" | "email";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsTwoFactor: boolean;
  twoFactorMethod: string | null;
  tempToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  clearTwoFactorState: () => void;
  loginWithUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsTwoFactor, setNeedsTwoFactor] = useState(false);
  const [twoFactorMethod, setTwoFactorMethod] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(`${API}/auth/profile`);
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Check auth status error:", error.message);
        } else {
          console.error("Unexpected auth status error:", error);
        }
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });

      if (res.data.requireTwoFactor) {
        setNeedsTwoFactor(true);
        setTwoFactorMethod(res.data.twoFactorMethod);
        setTempToken(res.data.tempToken);
        return;
      }

      if (!res.data.isVerified) {
        setUser(res.data);
        setIsAuthenticated(false);
        console.warn("E-Mail ist noch nicht verifiziert.");
        return;
      }

      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Login error:", error.message);
        throw error;
      } else {
        console.error("Unexpected login error:", error);
        throw new Error("An unexpected error occurred during login.");
      }
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      await axios.post(`${API}/auth/register`, { username, email, password });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Register error:", error.message);
        throw error;
      } else {
        console.error("Unexpected register error:", error);
        throw new Error("An unexpected error occurred during registration.");
      }
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const res = await axios.post(`${API}/auth/verify-2fa`, {
        code,
        tempToken,
      });
      setUser(res.data);
      setIsAuthenticated(true);
      clearTwoFactorState();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("2FA verification error:", error.message);
        throw error;
      } else {
        console.error("Unexpected 2FA error:", error);
        throw new Error(
          "An unexpected error occurred during 2FA verification."
        );
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Logout error:", error.message);
        throw error;
      } else {
        console.error("Unexpected logout error:", error);
        throw new Error("An unexpected error occurred during logout.");
      }
    }
  };

  const clearTwoFactorState = () => {
    setNeedsTwoFactor(false);
    setTwoFactorMethod(null);
    setTempToken(null);
  };

  const loginWithUser = (userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    clearTwoFactorState();
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      needsTwoFactor,
      twoFactorMethod,
      tempToken,
      login,
      register,
      verify2FA,
      logout,
      clearTwoFactorState,
      loginWithUser,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      needsTwoFactor,
      twoFactorMethod,
      tempToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
