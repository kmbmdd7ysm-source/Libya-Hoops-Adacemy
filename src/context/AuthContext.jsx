import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../services/supabase';

const C = createContext(null);
const LOCAL_ACCOUNTS_KEY = 'lha-local-accounts-v1';
const LOCAL_SESSION_KEY = 'lha-local-session-v1';

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const localUser = (record) => ({
  id: record.id,
  email: record.email,
  email_confirmed_at: record.emailConfirmedAt || null,
  confirmed_at: record.emailConfirmedAt || null,
  user_metadata: record.metadata || {},
  app_metadata: { provider: 'local' },
});
async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cloudConfigured, setCloudConfigured] = useState(false);

  useEffect(() => {
    let sub;
    let alive = true;
    (async () => {
      const s = await getSupabase();
      if (!alive) return;
      setCloudConfigured(Boolean(s));
      if (!s) {
        const saved = readJson(LOCAL_SESSION_KEY, null);
        if (saved?.user) {
          setSession(saved);
          setUser(saved.user);
        }
        setLoading(false);
        return;
      }
      const { data, error } = await s.auth.getSession();
      if (error) console.warn(error);
      setSession(data.session || null);
      setUser(data.session?.user || null);
      sub = s.auth.onAuthStateChange((_event, next) => {
        setSession(next);
        setUser(next?.user || null);
        setLoading(false);
      }).data.subscription;
      setLoading(false);
    })();
    return () => {
      alive = false;
      sub?.unsubscribe();
    };
  }, []);

  const client = useCallback(async () => await getSupabase(), []);

  const localSignUp = useCallback(async (email, password, metadata = {}) => {
    const normalized = String(email).trim().toLowerCase();
    const accounts = readJson(LOCAL_ACCOUNTS_KEY, []);
    if (accounts.some((item) => item.email === normalized)) {
      return { data: null, error: new Error('An account with this email already exists.') };
    }
    const record = {
      id: crypto.randomUUID?.() || `local-${Date.now()}`,
      email: normalized,
      passwordHash: await hashPassword(password),
      metadata,
      createdAt: new Date().toISOString(),
    };
    writeJson(LOCAL_ACCOUNTS_KEY, [...accounts, record]);
    const nextUser = localUser(record);
    const nextSession = { user: nextUser, access_token: `local-${record.id}` };
    writeJson(LOCAL_SESSION_KEY, nextSession);
    setUser(nextUser);
    setSession(nextSession);
    return { data: { user: nextUser, session: nextSession }, error: null };
  }, []);

  const localSignIn = useCallback(async (email, password) => {
    const normalized = String(email).trim().toLowerCase();
    const accounts = readJson(LOCAL_ACCOUNTS_KEY, []);
    const record = accounts.find((item) => item.email === normalized);
    if (!record || record.passwordHash !== (await hashPassword(password))) {
      return { data: null, error: new Error('Invalid email or password.') };
    }
    const nextUser = localUser(record);
    const nextSession = { user: nextUser, access_token: `local-${record.id}` };
    writeJson(LOCAL_SESSION_KEY, nextSession);
    setUser(nextUser);
    setSession(nextSession);
    return { data: { user: nextUser, session: nextSession }, error: null };
  }, []);

  const api = useMemo(
    () => ({
      user,
      session,
      loading,
      configured: true,
      cloudConfigured,
      signIn: async (email, password) => {
        const s = await client();
        return s ? s.auth.signInWithPassword({ email, password }) : localSignIn(email, password);
      },
      signUp: async (email, password, metadata = {}) => {
        const s = await client();
        return s
          ? s.auth.signUp({
              email,
              password,
              options: { data: metadata, emailRedirectTo: `${location.origin}/account` },
            })
          : localSignUp(email, password, metadata);
      },
      resendVerification: async (email) => {
        const s = await client();
        return s
          ? s.auth.resend({
              type: 'signup',
              email,
              options: { emailRedirectTo: `${location.origin}/account` },
            })
          : { data: {}, error: null };
      },
      updateMetadata: async (metadata = {}) => {
        const s = await client();
        if (s) return s.auth.updateUser({ data: metadata });
        if (!user?.email) return { data: null, error: new Error('Sign in first.') };
        const accounts = readJson(LOCAL_ACCOUNTS_KEY, []);
        let updatedRecord = null;
        const updated = accounts.map((item) => {
          if (item.email !== user.email) return item;
          updatedRecord = { ...item, metadata: { ...(item.metadata || {}), ...metadata } };
          return updatedRecord;
        });
        writeJson(LOCAL_ACCOUNTS_KEY, updated);
        const nextUser = localUser(updatedRecord || { email: user.email, metadata });
        const nextSession = { ...(session || {}), user: nextUser };
        writeJson(LOCAL_SESSION_KEY, nextSession);
        setUser(nextUser);
        setSession(nextSession);
        return { data: { user: nextUser }, error: null };
      },
      reset: async (email) => {
        const s = await client();
        if (s)
          return s.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/account?mode=reset-password`,
          });
        const exists = readJson(LOCAL_ACCOUNTS_KEY, []).some(
          (item) => item.email === String(email).trim().toLowerCase(),
        );
        return exists
          ? { data: {}, error: null }
          : { data: null, error: new Error('No account was found for this email.') };
      },
      updatePassword: async (password) => {
        const s = await client();
        if (s) return s.auth.updateUser({ password });
        if (!user?.email) return { data: null, error: new Error('Sign in first.') };
        const accounts = readJson(LOCAL_ACCOUNTS_KEY, []);
        const updated = await Promise.all(
          accounts.map(async (item) =>
            item.email === user.email
              ? { ...item, passwordHash: await hashPassword(password) }
              : item,
          ),
        );
        writeJson(LOCAL_ACCOUNTS_KEY, updated);
        return { data: { user }, error: null };
      },
      updateEmail: async (email) => {
        const s = await client();
        if (s) return s.auth.updateUser({ email });
        if (!user?.email) return { data: null, error: new Error('Sign in first.') };
        const normalized = String(email).trim().toLowerCase();
        const accounts = readJson(LOCAL_ACCOUNTS_KEY, []);
        if (accounts.some((item) => item.email === normalized && item.email !== user.email)) {
          return { data: null, error: new Error('An account with this email already exists.') };
        }
        let updatedRecord = null;
        const updated = accounts.map((item) => {
          if (item.email !== user.email) return item;
          updatedRecord = { ...item, email: normalized, emailConfirmedAt: null };
          return updatedRecord;
        });
        writeJson(LOCAL_ACCOUNTS_KEY, updated);
        const nextUser = localUser(updatedRecord);
        const nextSession = { ...(session || {}), user: nextUser };
        writeJson(LOCAL_SESSION_KEY, nextSession);
        setUser(nextUser);
        setSession(nextSession);
        return { data: { user: nextUser }, error: null };
      },
      signOut: async (scope) => {
        const s = await client();
        if (s) return s.auth.signOut(scope ? { scope } : undefined);
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setUser(null);
        setSession(null);
        return { error: null };
      },
      deleteAccount: async () => {
        const s = await client();
        if (s) {
          const { error } = await s.rpc('delete_own_account');
          if (error) throw error;
          await s.auth.signOut();
          return;
        }
        writeJson(
          LOCAL_ACCOUNTS_KEY,
          readJson(LOCAL_ACCOUNTS_KEY, []).filter((item) => item.email !== user?.email),
        );
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setUser(null);
        setSession(null);
      },
      refresh: async () => {
        const s = await client();
        if (s) {
          const { data, error } = await s.auth.refreshSession();
          if (error) throw error;
          return data;
        }
        return { session, user };
      },
    }),
    [user, session, loading, cloudConfigured, client, localSignIn, localSignUp],
  );

  return <C.Provider value={api}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
