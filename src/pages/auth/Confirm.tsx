import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function Confirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleConfirm = async () => {
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type") || "signup";

      if (!token_hash) {
        // Try getting session from URL hash (OAuth callback)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus("success");
          setTimeout(() => {
            const role = data.session!.user.user_metadata?.role || "tutor";
            const redirect = role === "tutor" ? "/tutor" : role === "agency" ? "/agency" : role === "parent" ? "/parent" : "/admin";
            navigate(redirect, { replace: true });
          }, 2000);
        } else {
          setStatus("error");
          setError("No verification token found");
        }
        return;
      }

      try {
        const email = searchParams.get("email") || "";
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: token_hash,
          type: type as any,
        });

        if (error) {
          setStatus("error");
          setError(error.message);
        } else {
          setStatus("success");
          setTimeout(() => navigate("/login", { replace: true }), 3000);
        }
      } catch (err) {
        setStatus("error");
        setError("Failed to verify email");
      }
    };

    handleConfirm();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}>
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            E
          </div>
          <span className="font-semibold text-xl text-white tracking-tight">EduVerify</span>
        </div>

        <div className="p-8 rounded-2xl text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
          {status === "loading" && (
            <>
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-white mb-2">Verifying your email...</h1>
              <p className="text-sm text-gray-400">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
              <h1 className="text-xl font-semibold text-white mb-2">Email Verified!</h1>
              <p className="text-sm text-gray-400 mb-4">Your account has been verified successfully.</p>
              <p className="text-xs text-gray-500">Redirecting to login...</p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle size={48} className="mx-auto mb-4" style={{ color: "#EF4444" }} />
              <h1 className="text-xl font-semibold text-white mb-2">Verification Failed</h1>
              <p className="text-sm text-gray-400 mb-4">{error || "Something went wrong"}</p>
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#22C55E", color: "black" }}
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
