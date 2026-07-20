import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSupabase } from '../services/supabase';
const C = createContext(null);
const missing = () => {
  throw Error('Cloud accounts are not configured. Add Supabase environment variables.');
};
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [session, setSession] = useState(null),
    [loading, setLoading] = useState(true),
    [configured, setConfigured] = useState(false);
  useEffect(() => {
    let sub,
      alive = true;
    (async () => {
      const s = await getSupabase();
      if (!alive) return;
      setConfigured(Boolean(s));
      if (!s) {
        setLoading(false);
        return;
      }
      const { data, error } = await s.auth.getSession();
      if (error) console.warn(error);
      setSession(data.session || null);
      setUser(data.session?.user || null);
      sub = s.auth.onAuthStateChange((_e, next) => {
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
  const client = useCallback(async () => (await getSupabase()) || missing(), []);
  const api = useMemo(
    () => ({
      user,
      session,
      loading,
      configured,
      signIn: async (email, password) =>
        (await client()).auth.signInWithPassword({ email, password }),
      signUp: async (email, password, metadata = {}) =>
        (await client()).auth.signUp({
          email,
          password,
          options: { data: metadata, emailRedirectTo: `${location.origin}/account` },
        }),
      resendVerification: async (email) =>
        (await client()).auth.resend({
          type: 'signup',
          email,
          options: { emailRedirectTo: `${location.origin}/account` },
        }),
      reset: async (email) =>
        (await client()).auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/account?mode=reset-password`,
        }),
      updatePassword: async (password) => (await client()).auth.updateUser({ password }),
      updateEmail: async (email) => (await client()).auth.updateUser({ email }),
      signOut: async (scope) => (await client()).auth.signOut(scope ? { scope } : undefined),
      deleteAccount: async () => {
        const s = await client();
        const { error } = await s.rpc('delete_own_account');
        if (error) throw error;
        await s.auth.signOut();
      },
      refresh: async () => {
        const { data, error } = await (await client()).auth.refreshSession();
        if (error) throw error;
        return data;
      },
    }),
    [user, session, loading, configured, client],
  );
  return <C.Provider value={api}>{children}</C.Provider>;
}
export const useAuth = () => useContext(C);
