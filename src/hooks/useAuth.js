import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const KEY = "portal_cikgu_anna_session";

export function useAuth() {
  const [session,         setSession]         = useState(null);
  const [sessionChecking, setSessionChecking] = useState(true);
  const [authLoading,     setAuthLoading]     = useState(false);
  const [authError,       setAuthError]       = useState("");

  // Verify stored session is legitimate on every load
  useEffect(() => {
    const verify = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(KEY) || "null");
        if (!stored) { setSessionChecking(false); return; }

        if (stored.role === "admin") {
          // Must have a real Supabase Auth session — can't be faked in DevTools
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) { localStorage.removeItem(KEY); setSessionChecking(false); return; }
          setSession(stored);
        } else if (stored.role === "parent" && stored.studentId) {
          // Verify studentId still exists in DB
          const { data } = await supabase.from("murid").select("id").eq("id", stored.studentId).single();
          if (!data) { localStorage.removeItem(KEY); setSessionChecking(false); return; }
          setSession(stored);
        } else {
          localStorage.removeItem(KEY);
        }
      } catch {
        localStorage.removeItem(KEY);
      }
      setSessionChecking(false);
    };
    verify();
  }, []);

  const login = async (username, password, role) => {
    setAuthLoading(true);
    setAuthError("");

    if (role === "admin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: username.trim(),
        password,
      });
      if (error) {
        setAuthError("Login gagal. Semak emel dan kata laluan.");
        setAuthLoading(false);
        return false;
      }
      const sess = { role: "admin", studentId: null, nama: "Cikgu Anna" };
      localStorage.setItem(KEY, JSON.stringify(sess));
      setSession(sess);
      setAuthLoading(false);
      return true;
    }

    // Parent — delima + tel
    const { data, error } = await supabase
      .from("murid")
      .select("*")
      .eq("delima", username.trim())
      .eq("tel", password.trim())
      .single();

    if (error || !data) {
      setAuthError("Login gagal. Semak ID Delima dan nombor telefon wali.");
      setAuthLoading(false);
      return false;
    }

    const sess = { role: "parent", studentId: data.id, nama: data.nama, wali: data.wali };
    localStorage.setItem(KEY, JSON.stringify(sess));
    setSession(sess);
    setAuthLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(KEY);
    setSession(null);
    setAuthError("");
  };

  return { session, sessionChecking, login, logout, authLoading, authError };
}
