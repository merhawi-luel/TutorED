import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";
import { adminApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { Shield, UserPlus, AlertCircle, CheckCircle, Mail, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface AdminUser { id: string; name: string; email: string; createdAt: string; }

export default function AdminAdmins() {
  const { ref, inView } = useInView();
  const { colors } = useTheme();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try { setLoading(true); const data = await adminApi.getAdmins(); setAdmins(data); } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (!name || !email || !password) { setError("All fields are required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setCreating(true);
    try {
      const result = await adminApi.createAdmin({ name, email, password });
      setSuccess(`Admin "${result.admin.name}" created successfully!`);
      setName(""); setEmail(""); setPassword(""); setShowForm(false); fetchAdmins();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) { setError(err.message || "Failed to create admin"); } finally { setCreating(false); }
  };

  const inputStyle: React.CSSProperties = { background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary };
  const cs: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>Admins</h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Manage administrator accounts. Only existing admins can create new admins.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style={{ background: colors.accent, color: "#fff" }}>
          <UserPlus size={16} /> Add Admin
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ background: colors.accentBg, border: `1px solid ${colors.accentBorder}`, color: colors.accent }}>
          <CheckCircle size={15} /> {success}
        </div>
      )}

      {showForm && (
        <div className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`} style={cs}>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={16} style={{ color: colors.accent }} />
            <h2 className="text-sm font-medium" style={{ color: colors.textSecondary }}>Create New Admin</h2>
          </div>
          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, color: colors.dangerColor }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={inputStyle} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm focus:outline-none transition-colors" style={inputStyle} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: colors.textMuted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={creating} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2"
                style={{ background: colors.accent, color: "#fff" }}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {creating ? "Creating..." : "Create Admin"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: colors.bgInput, color: colors.textMuted, border: `1px solid ${colors.borderColor}` }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`fade-up delay-200 ${inView ? "in-view" : ""}`}>
        {loading ? (
          <div className="rounded-xl p-10 text-center" style={cs}>
            <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: colors.accent }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={cs}>
            <Shield size={28} className="mx-auto mb-2" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>No admin accounts found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin, i) => (
              <div key={admin.id} className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`} style={cs}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--badge-purple-bg)" }}>
                    <Shield size={18} style={{ color: "var(--badge-purple-color)" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{admin.name}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{admin.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "var(--badge-purple-bg)", color: "var(--badge-purple-color)" }}>Admin</span>
                  <span className="text-xs" style={{ color: colors.textFaint }}>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}