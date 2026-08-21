import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  preferences?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  workspaceType: string;
  subscriptionPlan: string;
  role?: string;
  joinedAt?: string;
  [key: string]: unknown;
}

export interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: User }>;
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: Error | null; user?: User; workspace?: Workspace }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
  setCurrentWorkspaceId: (workspaceId: string) => void;
  updateCurrentUser?: (patch: Partial<User>) => Promise<User>;
  changePassword?: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function parseResponseJson<T>(res: Response): Promise<{ data: T | null; error: Error | null }> {
  let json: unknown = null;
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (isJson) {
    try {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        json = JSON.parse(text);
      }
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const errorObj = json as { error?: { message?: string } } | null;
    let msg = errorObj?.error?.message;
    if (!msg) {
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        msg = 'Authentication API service is currently unreachable. Please verify API server status.';
      } else {
        msg = `Authentication request failed (HTTP ${res.status})`;
      }
    }
    return { data: null, error: new Error(msg) };
  }

  if (json === null || json === undefined) {
    return { data: null, error: new Error('Server returned an empty response.') };
  }

  return { data: json as T, error: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspaceId, setCurrentWorkspaceIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async (): Promise<{ user: User | null; workspaces: Workspace[] }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      const { data, error } = await parseResponseJson<{ user?: User; workspaces?: Workspace[] }>(res);
      if (error || !data) {
        return { user: null, workspaces: [] };
      }

      return {
        user: data.user || null,
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : [],
      };
    } catch (err) {
      console.warn('[Syntrophos Auth] Failed to fetch active session:', err);
      return { user: null, workspaces: [] };
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const { user: fetchedUser, workspaces: fetchedWorkspaces } = await fetchMe();
    setUser(fetchedUser);
    setWorkspaces(fetchedWorkspaces);
    if (fetchedWorkspaces.length > 0 && fetchedWorkspaces[0]) {
      const firstWs = fetchedWorkspaces[0];
      setCurrentWorkspaceIdState((prev) =>
        prev && fetchedWorkspaces.some((w) => w.id === prev) ? prev : firstWs.id,
      );
    } else {
      setCurrentWorkspaceIdState(null);
    }
    setLoading(false);
  }, [fetchMe]);

  useEffect(() => {
    let isMounted = true;
    void fetchMe().then(({ user: fetchedUser, workspaces: fetchedWorkspaces }) => {
      if (isMounted) {
        setUser(fetchedUser);
        setWorkspaces(fetchedWorkspaces);
        if (fetchedWorkspaces.length > 0 && fetchedWorkspaces[0]) {
          setCurrentWorkspaceIdState(fetchedWorkspaces[0].id);
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [fetchMe]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; user?: User }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const { data, error } = await parseResponseJson<{ user: User }>(res);

      if (error || !data) {
        return {
          error: error || new Error('Invalid email address or password'),
        };
      }

      await refreshSession();
      return { error: null, user: data.user };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Unable to connect to authentication server'),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
  ): Promise<{ error: Error | null; user?: User; workspace?: Workspace }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name?.trim() || undefined,
        }),
      });

      const { data, error } = await parseResponseJson<{ user: User; workspace: Workspace }>(res);

      if (error || !data) {
        return {
          error: error || new Error('Failed to create account'),
        };
      }

      await refreshSession();
      return {
        error: null,
        user: data.user,
        workspace: data.workspace,
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err : new Error('Unable to connect to authentication server'),
      };
    }
  };


  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
    } catch (err) {
      console.warn('[Syntrophos Auth] Logout network error:', err);
    } finally {
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspaceIdState(null);
    }
    return { error: null };
  };

  const setCurrentWorkspaceId = (workspaceId: string) => {
    if (workspaces.some((w) => w.id === workspaceId)) {
      setCurrentWorkspaceIdState(workspaceId);
    }
  };

  const updateCurrentUser = async (patch: Partial<User>): Promise<User> => {
    if (!user) throw new Error('Not authenticated');
    const updated = { ...user, ...patch };
    setUser(updated);
    return updated;
  };

  const changePassword = async (): Promise<void> => {
    // Password change endpoint hook
  };

  const currentWorkspace = useMemo(
    () => workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0] ?? null,
    [workspaces, currentWorkspaceId],
  );

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      workspaces,
      currentWorkspace,
      loading,
      isAuthenticated: Boolean(user),
      signIn,
      signUp,
      signOut,
      refreshSession,
      setCurrentWorkspaceId,
      updateCurrentUser,
      changePassword,
    }),
    [user, workspaces, currentWorkspace, loading, refreshSession],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider />');
  }
  return context;
}
