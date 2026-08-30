import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, UserRole } from "@/types";
import type { Session } from "@supabase/supabase-js";

// ─── Context ───────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null; user: User | null }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<string | null>;
  loginWithGoogle: (role?: UserRole) => Promise<string | null>;
  logout: () => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<string | null>;
  resendVerification: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from our database
  const fetchUserProfile = async (authUser: any) => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        setLoading(false);
        return;
      }

      // Try to fetch from backend API
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "/api";
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        });

        if (res.ok) {
          const profile = await res.json();
          setUser(profile);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log("Backend API not available, using auth metadata");
      }

      // Fallback: User not in database or API unavailable (OAuth user)
      // Create a basic user from auth metadata
      const role = (authUser.user_metadata?.role as UserRole) || "tutor";
      
      setUser({
        id: authUser.id,
        name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
        email: authUser.email || "",
        role: role,
        createdAt: authUser.created_at || new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Register with email/password
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<string | null> => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Registration failed";
      }

      // Don't log in yet - user needs to verify email first
      return null;
    } catch (err) {
      return "Network error. Please try again.";
    }
  };

  // Login with email/password
  const login = async (email: string, password: string): Promise<{ error: string | null; user: User | null }> => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: data.error || "Login failed", user: null };
      }

      // Set the session in Supabase client
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      setUser(data.user);
      return { error: null, user: data.user };
    } catch (err) {
      return { error: "Network error. Please try again.", user: null };
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = async (role: UserRole = "tutor"): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          // Store role in session state so we can retrieve it after callback
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        return error.message;
      }

      // Store role in localStorage temporarily so callback can use it
      localStorage.setItem("pending_oauth_role", role);

      return null;
    } catch (err) {
      return "Failed to start Google login";
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email: string, token: string): Promise<string | null> => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, type: "signup" }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Verification failed";
      }

      // Set the session
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      return null;
    } catch (err) {
      return "Network error. Please try again.";
    }
  };

  // Resend verification email
  const resendVerification = async (email: string): Promise<string | null> => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      const res = await fetch(`${API_BASE}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Failed to resend";
      }

      return null;
    } catch (err) {
      return "Network error. Please try again.";
    }
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        verifyEmail,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
