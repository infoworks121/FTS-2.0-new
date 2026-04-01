import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (userData: AuthUser) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: () => { },
  signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session (one-time check, no polling)
    try {
      const stored = localStorage.getItem("fts_auth_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem("fts_auth_user");
    }
    setLoading(false);
  }, []);

  const signIn = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("fts_auth_user", JSON.stringify(userData));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem("fts_auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
