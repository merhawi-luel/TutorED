import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Confirm() {
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirm = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") || "signup";
      if (!token_hash) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus("success");
          setTimeout(() => {
            const role = data.session!.user.user_metadata?.role || "tutor";
            const redirect = role === "tutor" ? "/tutor" : role === "agency" ? "/agency" : role === "parent" ? "/parent" : "/admin";
            navigate(redirect, { replace: true });
          }, 2000);
        } else { setStatus("error"); setError("No verification token found"); }
        return;
      }
      try {
        const email = searchParams.get("email") || "";
        const { error } = await supabase.auth.verifyOtp({ email, token: token_hash, type: type as any });
        if (error) { setStatus("error"); setError(error.message); }
        else { setStatus("success"); setTimeout(() => navigate("/login", { replace: true }), 3000); }
      } catch { setStatus("error"); setError("Failed to verify email"); }
    };
    handleConfirm();
  }, [searchParams, navigate]);

  const pageBg = isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)`;
  const cardStyle: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: colors.logoGradient, color: isDark ? "#000" : "#fff" }}>E</div>
          <span className="font-semibold text-xl tracking-tight" style={{ color: colors.textPrimary }}>EduVerify</span>
        </div>
        <div className="p-8 rounded-2xl text-center" style={cardStyle}>
          {status === "loading" && (
            <>
              <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: `${colors.accent}40`, borderTopColor: colors.accent }} />
              <h1 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Verifying your email...</h1>
              <p className="text-sm" style={{ color: colors.textSecondary }}>Please wait a moment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: colors.accent }} />
              <h1 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Email Verified!</h1>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>Your account has been verified successfully.</p>
              <p className="text-xs" style={{ color: colors.textMuted }}>Redirecting to login...</p>
            </>
          )}
          {status === "error" && (
            <>
              <AlertCircle size={48} className="mx-auto mb-4" style={{ color: colors.dangerColor }} />
              <h1 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Verification Failed</h1>
              <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>{error || "Something went wrong"}</p>
              <button onClick={() => navigate("/login")} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: colors.accent, color: "#fff" }}>Go to Login</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}