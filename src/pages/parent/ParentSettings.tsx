import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useInView } from "@/hooks/useInView";
import {
  User,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ParentSettings() {
  const { user, logout } = useAuth();
  const { ref, inView } = useInView();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const inputStyle = { background: "var(--bg-input)", border: "1px solid var(--border-color)" };

  const handlePasswordChange = async () => {
    setPasswordMsg(null);

    if (!newPassword) {
      setPasswordMsg({ type: "error", text: "Please enter a new password." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ type: "error", text: error.message });
      } else {
        setPasswordMsg({ type: "success", text: "Password updated successfully!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your account settings.</p>
      </div>

      {/* Account Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-medium text-gray-300">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Full Name</label>
            <input
              value={user?.name || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-muted)]"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-muted)]"
              style={inputStyle}
            />
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} style={{ color: "var(--badge-pending-color)" }} />
          <h2 className="text-sm font-medium text-gray-300">Change Password</h2>
        </div>

        {passwordMsg && (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
            style={{
              background: passwordMsg.type === "success" ? "var(--accent-bg)" : "var(--danger-bg)",
              border: `1px solid ${passwordMsg.type === "success" ? "rgba(34,197,94,0.25)" : "var(--danger-bg)"}`,
              color: passwordMsg.type === "success" ? "var(--accent)" : "var(--danger-color)",
            }}
          >
            {passwordMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {passwordMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={passwordLoading || !newPassword || !confirmPassword}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2"
          style={{ background: "var(--badge-pending-bg)", color: "var(--badge-pending-color)", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          Update Password
        </button>
      </section>

      {/* Danger Zone */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--danger-bg)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} style={{ color: "var(--danger-color)" }} />
          <h2 className="text-sm font-medium text-gray-300">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}>
          <div>
            <div className="text-sm text-[var(--text-primary)]">Sign Out</div>
            <div className="text-xs text-[var(--text-muted)]">Sign out of your account on this device.</div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = "/"; }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--danger-bg)", color: "var(--danger-color)", border: "1px solid var(--danger-bg)" }}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
