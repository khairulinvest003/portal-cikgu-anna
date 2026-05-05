import { useState } from "react";
import { supabase } from "../supabase";

const KEY = "portal_cikgu_anna_session";

export function useAuth() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); }
    catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");

  const login = async (username, password, role) => {
    setAuthLoading(true);
    setAuthError("");

    if (role === "admin") {
      // Admin via Supabase Auth — no credentials in bundle
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

    // Parent — delima + tel query
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

  return { session, login, logout, authLoading, authError };
}
