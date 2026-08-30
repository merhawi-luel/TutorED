import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ralwwbfmrseuvlqsnmkd.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbHd3YmZtcnNldXZscXNubWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NjMyNjAsImV4cCI6MjEwMzMzOTI2MH0.UBttQcjXXFxkr2b93KOOX3lFqUuP922qzgpNwgY-V0w";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
