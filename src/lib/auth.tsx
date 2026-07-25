import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "sps_auth_session";

type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: { id: string; email: string; email_confirmed_at?: string | null };
};

type AuthContextValue = {
  session: Session | null;
  ready: boolean;
  isAdmin: boolean;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; needsConfirmation: boolean } | { ok: false; error: string }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  resendConfirmation: (
    email: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const FALLBACK_SUPABASE_URL = "https://wwmpgpsyvbbdrxjjsbui.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3bXBncHN5dmJiZHJ4ampzYnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDM0NjEsImV4cCI6MjA5NjYxOTQ2MX0.J1dIBtMdNDpQFbWmcEHjA3rUJVX_Wgzv3DOSXPiwPis";

function getEnv() {
  const url =
    (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
    FALLBACK_SUPABASE_URL;
  const key =
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
    FALLBACK_SUPABASE_ANON_KEY;
  return { url, key };
}

function readStored(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.access_token || !parsed?.user?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(session: Session | null) {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function parseErrorMessage(text: string, status: number): string {
  try {
    const body = JSON.parse(text);
    const msg =
      body?.error_description || body?.msg || body?.message || body?.error;
    if (typeof msg === "string" && msg.length > 0) return msg;
  } catch {
    // fall through
  }
  if (status === 400) return "Invalid email or password.";
  if (status === 422) return "Please use a valid email and a stronger password.";
  return "Something went wrong. Please try again.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (stored && stored.expires_at < Math.floor(Date.now() / 1000) + 60) {
      const { url, key } = getEnv();
      if (url && key && stored.refresh_token) {
        (async () => {
          try {
            const res = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
              method: "POST",
              headers: { apikey: key, "Content-Type": "application/json" },
              body: JSON.stringify({ refresh_token: stored.refresh_token }),
            });
            if (res.ok) {
              const body = await res.json();
              const next: Session = {
                access_token: body.access_token,
                refresh_token: body.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + (body.expires_in ?? 3600),
                user: {
                  id: body.user.id,
                  email: body.user.email,
                  email_confirmed_at: body.user.email_confirmed_at,
                },
              };
              persist(next);
              setSession(next);
            } else {
              persist(null);
              setSession(null);
            }
          } catch {
            persist(null);
            setSession(null);
          }
          setReady(true);
        })();
        return;
      }
      persist(null);
      setSession(null);
      setReady(true);
      return;
    }
    setSession(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    const { url, key } = getEnv();
    if (!url || !key) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${url}/rest/v1/admins?select=email&email=eq.${encodeURIComponent(
            session.user.email.toLowerCase(),
          )}`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );
        if (!res.ok) {
          if (!cancelled) setIsAdmin(false);
          return;
        }
        const rows = await res.json();
        if (!cancelled) setIsAdmin(Array.isArray(rows) && rows.length > 0);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  const signUp = useCallback<AuthContextValue["signUp"]>(
    async (email, password) => {
      const { url, key } = getEnv();
      if (!url || !key) return { ok: false, error: "Auth is not configured." };
      try {
        const res = await fetch(`${url}/auth/v1/signup`, {
          method: "POST",
          headers: {
            apikey: key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const text = await res.text();
        if (!res.ok) {
          return { ok: false, error: parseErrorMessage(text, res.status) };
        }
        const body = text ? JSON.parse(text) : {};
        const accessToken = body?.access_token as string | undefined;
        if (accessToken && body?.user) {
          const next: Session = {
            access_token: accessToken,
            refresh_token: body.refresh_token,
            expires_at: Math.floor(Date.now() / 1000) + (body.expires_in ?? 3600),
            user: {
              id: body.user.id,
              email: body.user.email,
              email_confirmed_at: body.user.email_confirmed_at,
            },
          };
          persist(next);
          setSession(next);
          return { ok: true, needsConfirmation: false };
        }
        return { ok: true, needsConfirmation: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const signIn = useCallback<AuthContextValue["signIn"]>(
    async (email, password) => {
      const { url, key } = getEnv();
      if (!url || !key) return { ok: false, error: "Auth is not configured." };
      try {
        const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            apikey: key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        const text = await res.text();
        if (!res.ok) {
          return { ok: false, error: parseErrorMessage(text, res.status) };
        }
        const body = JSON.parse(text);
        const next: Session = {
          access_token: body.access_token,
          refresh_token: body.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + (body.expires_in ?? 3600),
          user: {
            id: body.user.id,
            email: body.user.email,
            email_confirmed_at: body.user.email_confirmed_at,
          },
        };
        persist(next);
        setSession(next);
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const signOut = useCallback(() => {
    persist(null);
    setSession(null);
  }, []);

  const resendConfirmation = useCallback<AuthContextValue["resendConfirmation"]>(
    async (email) => {
      const { url, key } = getEnv();
      if (!url || !key) return { ok: false, error: "Auth is not configured." };
      try {
        const res = await fetch(`${url}/auth/v1/resend`, {
          method: "POST",
          headers: {
            apikey: key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ type: "signup", email }),
        });
        if (!res.ok) {
          const text = await res.text();
          return { ok: false, error: parseErrorMessage(text, res.status) };
        }
        return { ok: true };
      } catch {
        return { ok: false, error: "Network error. Please try again." };
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ session, ready, isAdmin, signUp, signIn, signOut, resendConfirmation }),
    [session, ready, isAdmin, signUp, signIn, signOut, resendConfirmation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
