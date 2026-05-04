import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uxfijcxfajzrzkdkciid.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZmlqY3hmYWp6cnprZGtjaWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODc0OTUsImV4cCI6MjA5MzQ2MzQ5NX0.urgmHhLMD3GL1F-xFuqlz_GrQvNh2nxjSTNfirQ7e0g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
