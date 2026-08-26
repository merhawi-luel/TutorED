import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, AlertCircle, Eye, EyeOff, GraduationCap, Building2, Users, CheckCircle, Mail } from "lucide-react";

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

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
    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    // Registration successful - show verification message
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setLoading(true);
    const err = await loginWithGoogle(role);
    if (err) {
      setError(err);
      setLoading(false);
    }
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  // Success state - show verification message
  if (success) {
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
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              <Mail size={32} style={{ color: "#22C55E" }} />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Check Your Email</h1>
            <p className="text-sm text-gray-400 mb-6">
              We sent a verification link to <span className="text-white font-medium">{email}</span>.
              Click the link to verify your account.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => { setSuccess(false); setError(null); }}
                className="hover:underline"
                style={{ color: "#22C55E" }}
              >
                try again
              </button>.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "#22C55E", color: "black" }}
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            E
          </div>
          <span className="font-semibold text-xl text-white tracking-tight">EduVerify</span>
        </div>

        <div className="p-8 rounded-2xl" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
          <h1 className="text-xl font-semibold text-white mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 mb-6">Join the education talent network</p>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-3 mb-4"
            style={{ background: "#FFFFFF", color: "#000000" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: "#1F1F1F" }} />
            <span className="text-xs text-gray-500">or register with email</span>
            <div className="flex-1 h-px" style={{ background: "#1F1F1F" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "tutor" as const, label: "Tutor", desc: "Find opportunities", icon: GraduationCap },
                  { value: "agency" as const, label: "Agency", desc: "Recruit educators", icon: Building2 },
                  { value: "parent" as const, label: "Parent", desc: "Find a tutor", icon: Users },
                ]).map((opt) => {
                  const Icon = opt.icon;
                  const isActive = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRole(opt.value)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center"
                      style={{
                        background: isActive ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      <Icon size={18} style={{ color: isActive ? "#22C55E" : "#6B7280" }} />
                      <span className="text-xs font-medium" style={{ color: isActive ? "#22C55E" : "#9CA3AF" }}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={inputStyle}
                placeholder={role === "tutor" ? "John Doe" : role === "parent" ? "Jane Smith" : "My Academy"}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={inputStyle}
                placeholder={role === "tutor" ? "you@example.com" : role === "parent" ? "parent@example.com" : "admin@myacademy.com"}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#22C55E", color: "black" }}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-medium hover:underline" style={{ color: "#22C55E" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
