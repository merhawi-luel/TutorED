import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useInView } from "@/hooks/useInView";
import {
  User,
  Lock,
  Shield,
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Globe,
} from "lucide-react";

export default function AdminSettings() {
  const { user, logout } = useAuth();
  const { ref, inView } = useInView();

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Platform settings state
  const [autoVerifyOrgs, setAutoVerifyOrgs] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [allowPublicSignup, setAllowPublicSignup] = useState(true);
  const [saved, setSaved] = useState(false);

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

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

  const handleSavePlatform = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your admin account and platform configuration.</p>
      </div>

      {/* Account Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: "#22C55E" }} />
          <h2 className="text-sm font-medium text-gray-300">Admin Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Name</label>
            <input
              value={user?.name || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="rounded-xl px-4 py-2.5" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: "#4ADE80" }}>
            <Shield size={13} />
            Platform Administrator — Full access to all admin features.
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} style={{ color: "#F59E0B" }} />
          <h2 className="text-sm font-medium text-gray-300">Change Password</h2>
        </div>

        {passwordMsg && (
          <div
            className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
            style={{
              background: passwordMsg.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${passwordMsg.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}`,
              color: passwordMsg.type === "success" ? "#4ADE80" : "#F87171",
            }}
          >
            {passwordMsg.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {passwordMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={passwordLoading || !newPassword || !confirmPassword}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2"
          style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          Update Password
        </button>
      </section>

      {/* Platform Settings */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Settings size={16} style={{ color: "#A855F7" }} />
            <h2 className="text-sm font-medium text-gray-300">Platform Configuration</h2>
          </div>
          <button
            onClick={handleSavePlatform}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "#22C55E", color: "black" }}
          >
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Require Email Verification", desc: "New users must verify their email before accessing the platform", value: requireEmailVerification, onChange: setRequireEmailVerification, icon: Globe },
            { label: "Allow Public Signup", desc: "Allow new users to register accounts on the platform", value: allowPublicSignup, onChange: setAllowPublicSignup, icon: Globe },
            { label: "Auto-Verify Organizations", desc: "Automatically verify newly registered organizations (not recommended)", value: autoVerifyOrgs, onChange: setAutoVerifyOrgs, icon: Database },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={14} className="text-gray-500 shrink-0" />
                  <div>
                    <div className="text-sm text-white">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className="relative w-10 h-5 rounded-full transition-colors shrink-0"
                  style={{ background: item.value ? "#22C55E" : "#2A2A2A" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                    style={{ left: item.value ? "22px" : "2px" }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Danger Zone */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-400 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} style={{ color: "#EF4444" }} />
          <h2 className="text-sm font-medium text-gray-300">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
          <div>
            <div className="text-sm text-white">Sign Out</div>
            <div className="text-xs text-gray-500">Sign out of the admin dashboard.</div>
          </div>
          <button
            onClick={() => { logout(); window.location.href = "/"; }}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
