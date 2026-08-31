import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogIn, AlertCircle, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login, loginWithGoogle, verifyEmail, resendVerification } = useAuth();
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"tutor" | "agency" | "parent">("tutor");

  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyEmailAddr, setVerifyEmailAddr] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      if (result.error.includes("verify your email")) {
        setVerifyEmailAddr(email);
        setShowVerify(true);
        setLoading(false);
        return;
      }
      setError(result.error);
      setLoading(false);
      return;
    }

    const loginUser = result.user;
    const redirect = loginUser?.role === "agency" ? "/agency" : loginUser?.role === "parent" ? "/parent" : loginUser?.role === "admin" ? "/admin" : "/tutor";
    navigate(redirect);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const err = await loginWithGoogle(role);
    if (err) { setError(err); setLoading(false); }
  };

  const handleVerifyEmail = async () => {
    setError(null);
    setLoading(true);
    const err = await verifyEmail(verifyEmailAddr, verifyCode);
    if (err) { setError(err); setLoading(false); return; }
    setVerifySuccess(true);
    setLoading(false);
    setTimeout(() => { setShowVerify(false); setVerifySuccess(false); }, 2000);
  };

  const handleResendVerification = async () => {
    setResendSuccess(false);
    const err = await resendVerification(verifyEmailAddr);
    if (!err) { setResendSuccess(true); setTimeout(() => setResendSuccess(false), 3000); }
  };

  const inputStyle: React.CSSProperties = { background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary };
  const pageBg = isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)`;
  const cardStyle: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  const Logo = () => (
    <div className="flex items-center gap-3 mb-8 justify-center">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: colors.logoGradient, color: isDark ? "#000" : "#fff" }}>E</div>
      <span className="font-semibold text-xl tracking-tight" style={{ color: colors.textPrimary }}>EduVerify</span>
    </div>
  );

  if (showVerify) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
        <div className="w-full max-w-md">
          <Logo />
          <div className="p-8 rounded-2xl" style={cardStyle}>
            {verifySuccess ? (
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: colors.accent }} />
                <h1 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Email Verified!</h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>You can now login with your credentials.</p>
              </div>
            ) : (
              <>
                <button onClick={() => { setShowVerify(false); setError(null); }} className="flex items-center gap-2 text-sm mb-4 transition-colors" style={{ color: colors.textMuted }}>
                  <ArrowLeft size={16} /> Back to login
                </button>
                <h1 className="text-xl font-semibold mb-1" style={{ color: colors.textPrimary }}>Verify Your Email</h1>
                <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                  We sent a verification code to <span style={{ color: colors.textPrimary }}>{verifyEmailAddr}</span>
                </p>
                {error && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm" style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, color: colors.dangerColor }}>
                    <AlertCircle size={15} /> {error}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Verification Code</label>
                    <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-center tracking-widest focus:outline-none transition-colors"
                      style={inputStyle} placeholder="000000" autoFocus />
                  </div>
                  <button onClick={handleVerifyEmail} disabled={loading || verifyCode.length < 6}
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ background: colors.accent, color: "#fff" }}>
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle size={16} /> Verify Email</>}
                  </button>
                  <div className="text-center">
                    <button onClick={handleResendVerification} className="text-xs transition-colors" style={{ color: colors.textMuted }}>
                      {resendSuccess ? <span style={{ color: colors.accent }}>✓ Code sent!</span> : "Didn't receive a code? Resend"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
      <div className="w-full max-w-md">
        <Logo />
        <div className="p-8 rounded-2xl" style={cardStyle}>
          <h1 className="text-xl font-semibold mb-1" style={{ color: colors.textPrimary }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm" style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, color: colors.dangerColor }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>I am a</label>
            <div className="grid grid-cols-3 gap-2">
              {(["tutor", "agency", "parent"] as const).map((v) => {
                const isActive = role === v;
                return (
                  <button key={v} type="button" onClick={() => setRole(v)} className="px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize"
                    style={{ background: isActive ? colors.accentBg : "transparent", border: `1px solid ${isActive ? colors.accentBorder : colors.borderColor}`, color: isActive ? colors.accent : colors.textMuted }}>
                    {v}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-3 mb-4"
            style={{ background: isDark ? "#FFFFFF" : colors.bgInput, color: isDark ? "#000000" : colors.textPrimary, border: `1px solid ${colors.borderColor}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: colors.borderColor }} />
            <span className="text-xs" style={{ color: colors.textMuted }}>or sign in with email</span>
            <div className="flex-1 h-px" style={{ background: colors.borderColor }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={inputStyle} placeholder="you@example.com" autoFocus />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none transition-colors"
                  style={inputStyle} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: colors.textMuted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: colors.accent, color: "#fff" }}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: colors.textSecondary }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium hover:underline" style={{ color: colors.accent }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}