import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useInView } from "@/hooks/useInView";
import {
  User,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  BadgeCheck,
  XCircle,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function AgencySettings() {
  const { user, logout } = useAuth();
  const { ref, inView } = useInView();

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Notification state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newApplicantAlerts, setNewApplicantAlerts] = useState(true);
  const [vacancyDeadlines, setVacancyDeadlines] = useState(true);
  const [saved, setSaved] = useState(false);

  // Payment state
  const [paymentInfo, setPaymentInfo] = useState<{ paymentStatus: string; txRef: string | null; paidAt: string | null; isVerified: boolean } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/payment/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPaymentInfo(data);
        }
      } catch (err) {
        console.error("Failed to fetch payment status:", err);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchPaymentStatus();
  }, []);

  const handlePayEntrance = async () => {
    if (!user) return;
    setPaying(true);
    try {
      const [firstName, ...lastNameParts] = (user.name || "").split(" ");
      const response = await fetch(`${API_BASE}/agency/pay-entrance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: user.email,
          firstName: firstName || "Agency",
          lastName: lastNameParts.join(" ") || "User",
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to initialize payment");
      }
      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err: any) {
      alert(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const paymentStatus = paymentInfo?.paymentStatus || "unpaid";

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

  const handleSaveNotifications = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your organization account and preferences.</p>
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
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">Contact Name</label>
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
        <p className="text-xs text-[var(--text-faint)]">
          Organization details can be managed in the Organization tab.
        </p>
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

      {/* Notification Preferences */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: "var(--badge-info-color)" }} />
            <h2 className="text-sm font-medium text-gray-300">Notification Preferences</h2>
          </div>
          <button
            onClick={handleSaveNotifications}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {saved ? <CheckCircle size={13} /> : <Save size={13} />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Email Notifications", desc: "Receive general updates via email", value: emailNotifications, onChange: setEmailNotifications },
            { label: "New Applicant Alerts", desc: "Get notified when someone applies to your vacancies", value: newApplicantAlerts, onChange: setNewApplicantAlerts },
            { label: "Vacancy Deadline Reminders", desc: "Get reminded before vacancy deadlines", value: vacancyDeadlines, onChange: setVacancyDeadlines },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
            >
              <div>
                <div className="text-sm text-[var(--text-primary)]">{item.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: item.value ? "var(--accent)" : "var(--border-color)" }}
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

      {/* Get Verified */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-350 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck size={16} style={{ color: "var(--accent)" }} />
          <h2 className="text-sm font-medium text-gray-300">Get Verified</h2>
        </div>

        {paymentLoading ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm py-3">
            <Loader2 size={14} className="animate-spin" />
            Checking verification status...
          </div>
        ) : paymentStatus === "paid" ? (
          <div className="space-y-3">
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
            >
              <CheckCircle size={18} style={{ color: "var(--accent)" }} />
              <div>
                <div className="text-sm text-green-400 font-medium">Agency Verified</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Your agency has been verified. You can post vacancies and recruit tutors.
                </div>
              </div>
            </div>
            {paymentInfo?.paidAt && (
              <p className="text-xs text-[var(--text-faint)]">
                Verified on {new Date(paymentInfo.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : paymentStatus === "pending" ? (
          <div className="space-y-3">
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Clock size={18} style={{ color: "var(--badge-pending-color)" }} />
              <div>
                <div className="text-sm text-yellow-400 font-medium">Payment Processing</div>
                <div className="text-xs text-[var(--text-muted)]">
                  Your payment is being processed. This may take a few minutes.
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: "var(--badge-pending-bg)", color: "var(--badge-pending-color)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              Pay a one-time entrance fee to get verified and start posting vacancies.
            </p>
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}>
              <div>
                <div className="text-sm text-[var(--text-primary)]">Entrance Fee</div>
                <div className="text-xs text-[var(--text-muted)]">One-time payment, non-refundable unless rejected</div>
              </div>
              <span className="text-lg font-bold text-green-400">5,000 ETB</span>
            </div>
            <button
              onClick={handlePayEntrance}
              disabled={paying}
              className="w-full px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {paying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  Pay Entrance Fee
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Billing */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-400 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} style={{ color: "var(--badge-purple-color)" }} />
          <h2 className="text-sm font-medium text-gray-300">Billing & Subscription</h2>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--text-primary)]">Free Plan</div>
              <div className="text-xs text-[var(--text-muted)]">Limited vacancies and features</div>
            </div>
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
            >
              Active
            </span>
          </div>
        </div>

        <p className="text-xs text-[var(--text-faint)]">
          Upgrade to Professional for unlimited vacancies, applicant management, and analytics.
          Coming soon.
        </p>
      </section>

      {/* Danger Zone */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-500 ${inView ? "in-view" : ""}`}
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
