import { useState } from "react";
import { supabase } from "../supabase";

const KEY = "portal_cikgu_anna_session";
const ADMIN_USER = "teacheranna";
const ADMIN_PASS = "anna1993";

export function useAuth() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)); }
    catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");

  const login = async (username, password) => {
    setAuthLoading(true);
    setAuthError("");

    // Admin check
    if (username.trim() === ADMIN_USER && password === ADMIN_PASS) {
      const sess = { role: "admin", studentId: null, nama: "Cikgu Anna" };
      localStorage.setItem(KEY, JSON.stringify(sess));
      setSession(sess);
      setAuthLoading(false);
      return true;
    }

    // Parent check — no = username, tel = password
    const { data, error } = await supabase
      .from("murid")
      .select("*")
      .eq("no", username.trim().padStart(2, "0"))
      .eq("tel", password.trim())
      .single();

    if (error || !data) {
      setAuthError("Login failed. Check the student number and guardian's phone number.");
      setAuthLoading(false);
      return false;
    }

    const sess = { role: "parent", studentId: data.id, nama: data.nama, wali: data.wali };
    localStorage.setItem(KEY, JSON.stringify(sess));
    setSession(sess);
    setAuthLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setSession(null);
    setAuthError("");
  };

  return { session, login, logout, authLoading, authError };
}
