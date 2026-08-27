import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AUTH_TOKEN_KEY,
  getStoredToken,
  getUserFromToken,
  removeStoredToken,
  storeToken,
  type AuthUser,
} from "../utils/auth";
import { AUTH_UNAUTHORIZED_EVENT } from "../services/api";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function readInitialSession(): { token: string | null; user: AuthUser | null } {
  const token = getStoredToken();
  if (!token) return { token: null, user: null };

  const user = getUserFromToken(token);
  if (!user) {
    removeStoredToken();
    return { token: null, user: null };
  }

  return { token, user };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSessionState] = useState(readInitialSession);

  const logout = useCallback(() => {
    removeStoredToken();
    setSessionState({ token: null, user: null });
  }, []);

  const setSession = useCallback((token: string): boolean => {
    const user = getUserFromToken(token);
    if (!user) {
      removeStoredToken();
      setSessionState({ token: null, user: null });
      return false;
    }

    try {
      storeToken(token);
      setSessionState({ token, user });
      return true;
    } catch {
      setSessionState({ token: null, user: null });
      return false;
    }
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_TOKEN_KEY) return;

      const nextToken = event.newValue;
      const nextUser = nextToken ? getUserFromToken(nextToken) : null;
      setSessionState(nextUser ? { token: nextToken, user: nextUser } : { token: null, user: null });
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  useEffect(() => {
    if (!session.user?.expiresAt) return undefined;

    const millisecondsUntilExpiry = session.user.expiresAt - Date.now();
    if (millisecondsUntilExpiry <= 0) {
      logout();
      return undefined;
    }

    const timer = window.setTimeout(logout, millisecondsUntilExpiry);
    return () => window.clearTimeout(timer);
  }, [logout, session.user?.expiresAt]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session.token,
      user: session.user,
      isAuthenticated: Boolean(session.token && session.user),
      setSession,
      logout,
    }),
    [logout, session.token, session.user, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
