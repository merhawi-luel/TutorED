import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

export default function Callback() {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) { setError(error.message); return; }

      if (data.session) {
        const pendingRole = localStorage.getItem("pending_oauth_role") || "tutor";
        localStorage.removeItem("pending_oauth_role");
        let role = data.session.user.user_metadata?.role;
        if (!role) {
          const { error: updateError } = await supabase.auth.updateUser({ data: { role: pendingRole } });
          if (updateError) console.error(updateError);
          role = pendingRole;
        }
        try {
          const API_BASE = import.meta.env.VITE_API_URL || "/api";
          const response = await fetch(`${API_BASE}/auth/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: data.session.access_token, refresh_token: data.session.refresh_token }),
          });
          if (!response.ok) { const d = await response.json(); throw new Error(d.error || "Failed to sync"); }
        } catch (syncError: any) { setError(`Database sync failed: ${syncError.message}`); return; }
        const redirect = role === "tutor" ? "/tutor" : role === "agency" ? "/agency" : role === "parent" ? "/parent" : "/admin";
        navigate(redirect, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    };
    handleCallback();
  }, [navigate]);

  const pageBg = isDark ? "#000" : colors.bgPage;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: colors.dangerColor }}>{error}</p>
          <button onClick={() => navigate("/login")} className="px-4 py-2 rounded-lg text-sm" style={{ background: colors.accent, color: "#fff" }}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: pageBg }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `${colors.accent}40`, borderTopColor: colors.accent }} />
        <p className="text-sm" style={{ color: colors.textSecondary }}>Signing you in...</p>
      </div>
    </div>
  );
}