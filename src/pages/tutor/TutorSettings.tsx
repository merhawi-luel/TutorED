import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useInView } from "@/hooks/useInView";
import {
  User,
  Lock,
  Bell,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";

export default function TutorSettings() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { ref, inView } = useInView();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [vacancyAlerts, setVacancyAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [saved, setSaved] = useState(false);

  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const cardBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const inputBg = isDark ? "#0D0D0D" : "#F1F5F9";
  const inputBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const textPrimary = isDark ? "#FFFFFF" : "#0F172A";
  const textSecondary = isDark ? "#9CA3AF" : "#475569";
  const textMuted = isDark ? "#6B7280" : "#94A3B8";
  const textFaint = isDark ? "#4B5563" : "#CBD5E1";

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMsg({ type: "error", text: error.message });
      } else {
        setPasswordMsg({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Failed to update password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>Manage your account and preferences.</p>
      </div>

      {/* Appearance */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-50 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          {isDark ? <Sun size={16} style={{ color: "#F59E0B" }} /> : <Moon size={16} style={{ color: "#6366F1" }} />}
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Appearance</h2>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
        >
          <div>
            <div className="text-sm" style={{ color: textPrimary }}>Theme</div>
            <div className="text-xs" style={{ color: textMuted }}>{isDark ? "Dark mode" : "Light mode"} is currently active</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "#22C55E", color: "black" }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            Switch to {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </section>

      {/* Account Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: "#22C55E" }} />
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Account Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Full Name</label>
            <input
              value={user?.name || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textFaint }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Email</label>
            <input
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textFaint }}
            />
          </div>
        </div>
        <p className="text-xs" style={{ color: textFaint }}>
          Contact support to update your name or email address.
        </p>
      </section>

      {/* Change Password */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Lock size={16} style={{ color: "#F59E0B" }} />
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Change Password</h2>
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
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={passwordLoading || !newPassword || !confirmPassword}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
          style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", minWidth: 180 }}
        >
          {passwordLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          Update Password
        </button>
      </section>

      {/* Notification Preferences */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: "#3B82F6" }} />
            <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Notification Preferences</h2>
          </div>
          <button
            onClick={handleSaveNotifications}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "#22C55E", color: "black" }}
          >
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Email Notifications", desc: "Receive general updates via email", value: emailNotifications, onChange: setEmailNotifications },
            { label: "New Vacancy Alerts", desc: "Get notified when new matching vacancies are posted", value: vacancyAlerts, onChange: setVacancyAlerts },
            { label: "Application Updates", desc: "Get notified when your application status changes", value: applicationUpdates, onChange: setApplicationUpdates },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
            >
              <div>
                <div className="text-sm" style={{ color: textPrimary }}>{item.label}</div>
                <div className="text-xs" style={{ color: textMuted }}>{item.desc}</div>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: item.value ? "#22C55E" : isDark ? "#2A2A2A" : "#CBD5E1" }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ left: item.value ? "22px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-400 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} style={{ color: "#EF4444" }} />
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: inputBg, border: `1px solid ${inputBorder}` }}>
          <div>
            <div className="text-sm" style={{ color: textPrimary }}>Sign Out</div>
            <div className="text-xs" style={{ color: textMuted }}>Sign out of your account on this device.</div>
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
