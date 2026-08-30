import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";
import { adminApi } from "@/lib/api";
import {
  Shield,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminAdmins() {
  const { ref, inView } = useInView();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAdmins();
      setAdmins(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const result = await adminApi.createAdmin({ name, email, password });
      setSuccess(`Admin "${result.admin.name}" created successfully!`);
      setName("");
      setEmail("");
      setPassword("");
      setShowForm(false);
      fetchAdmins();
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Admins</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage administrator accounts. Only existing admins can create new admins.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          <UserPlus size={16} />
          Add Admin
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle size={15} />
          {success}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div
          className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid #1F1F1F" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <UserPlus size={16} style={{ color: "#22C55E" }} />
            <h2 className="text-sm font-medium text-gray-300">Create New Admin</h2>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                  style={inputStyle}
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

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-2"
                style={{ background: "#22C55E", color: "black" }}
              >
                {creating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                {creating ? "Creating..." : "Create Admin"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "#9CA3AF", border: "1px solid #1F1F1F" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin list */}
      <div className={`fade-up delay-200 ${inView ? "in-view" : ""}`}>
        {loading ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <Loader2 size={24} className="mx-auto mb-2 animate-spin" style={{ color: "#22C55E" }} />
            <p className="text-sm text-gray-400">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <Shield size={28} className="mx-auto mb-2" style={{ color: "#6B7280" }} />
            <p className="text-sm text-gray-400">No admin accounts found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {admins.map((admin, i) => (
              <div
                key={admin.id}
                className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(168,85,247,0.15)" }}
                  >
                    <Shield size={18} style={{ color: "#A855F7" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{admin.name}</div>
                    <div className="text-xs text-gray-500">{admin.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(168,85,247,0.15)", color: "#C084FC" }}
                  >
                    Admin
                  </span>
                  <span className="text-xs text-gray-600">
                    Joined {new Date(admin.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
