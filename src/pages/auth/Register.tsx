import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { UserPlus, AlertCircle, Eye, EyeOff, GraduationCap, Building2, Users, Mail } from "lucide-react";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const { colors, isDark } = useTheme();

  const [role, setRole] = useState<"tutor" | "agency" | "parent">("tutor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await register(name, email, password, role);
    if (err) { setError(err); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setLoading(true);
    const err = await loginWithGoogle(role);
    if (err) { setError(err); setLoading(false); }
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: pageBg }}>
        <div className="w-full max-w-md">
          <Logo />
          <div className="p-8 rounded-2xl text-center" style={cardStyle}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: colors.accentBg }}>
              <Mail size={32} style={{ color: colors.accent }} />
            </div>
            <h1 className="text-xl font-semibold mb-2" style={{ color: colors.textPrimary }}>Check Your Email</h1>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              We sent a verification link to <span className="font-medium" style={{ color: colors.textPrimary }}>{email}</span>. Click the link to verify your account.
            </p>
            <p className="text-xs mb-6" style={{ color: colors.textMuted }}>
              Didn't receive the email? Check your spam folder or{" "}
              <button onClick={() => { setSuccess(false); setError(null); }} className="hover:underline" style={{ color: colors.accent }}>try again</button>.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: colors.accent, color: "#fff" }}>
              Go to Login
            </Link>
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
          <h1 className="text-xl font-semibold mb-1" style={{ color: colors.textPrimary }}>Create Account</h1>
          <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>Join the education talent network</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm" style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, color: colors.dangerColor }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <button onClick={handleGoogleRegister} disabled={loading}
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
            <span className="text-xs" style={{ color: colors.textMuted }}>or register with email</span>
            <div className="flex-1 h-px" style={{ background: colors.borderColor }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "tutor" as const, label: "Tutor", icon: GraduationCap },
                  { value: "agency" as const, label: "Agency", icon: Building2 },
                  { value: "parent" as const, label: "Parent", icon: Users },
                ]).map((opt) => {
                  const Icon = opt.icon;
                  const isActive = role === opt.value;
                  return (
                    <button key={opt.value} type="button" onClick={() => setRole(opt.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center"
                      style={{ background: isActive ? colors.accentBg : "transparent", border: `1px solid ${isActive ? colors.accentBorder : colors.borderColor}` }}>
                      <Icon size={18} style={{ color: isActive ? colors.accent : colors.textMuted }} />
                      <span className="text-xs font-medium" style={{ color: isActive ? colors.accent : colors.textMuted }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={inputStyle} placeholder={role === "tutor" ? "John Doe" : role === "parent" ? "Jane Smith" : "My Academy"} />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: colors.textSecondary }}>Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none transition-colors" style={inputStyle} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.textMuted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: colors.accent, color: "#fff" }}>
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>
        </div>
        <p className="text-center text-sm mt-5" style={{ color: colors.textSecondary }}>
          Already have an account? <Link to="/login" className="font-medium hover:underline" style={{ color: colors.accent }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}