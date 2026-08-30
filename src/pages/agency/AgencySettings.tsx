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

  const handleSaveNotifications = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your organization account and preferences.</p>
      </div>

      {/* Account Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: "#22C55E" }} />
          <h2 className="text-sm font-medium text-gray-300">Account Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Contact Name</label>
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
        <p className="text-xs text-gray-600">
          Organization details can be managed in the Organization tab.
        </p>
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

      {/* Notification Preferences */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: "#3B82F6" }} />
            <h2 className="text-sm font-medium text-gray-300">Notification Preferences</h2>
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
            { label: "New Applicant Alerts", desc: "Get notified when someone applies to your vacancies", value: newApplicantAlerts, onChange: setNewApplicantAlerts },
            { label: "Vacancy Deadline Reminders", desc: "Get reminded before vacancy deadlines", value: vacancyDeadlines, onChange: setVacancyDeadlines },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
            >
              <div>
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
              <button
                onClick={() => item.onChange(!item.value)}
                className="relative w-10 h-5 rounded-full transition-colors"
                style={{ background: item.value ? "#22C55E" : "#2A2A2A" }}
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
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <BadgeCheck size={16} style={{ color: "#22C55E" }} />
          <h2 className="text-sm font-medium text-gray-300">Get Verified</h2>
        </div>

        {paymentLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-sm py-3">
            <Loader2 size={14} className="animate-spin" />
            Checking verification status...
          </div>
        ) : paymentStatus === "paid" ? (
          <div className="space-y-3">
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
            >
              <CheckCircle size={18} style={{ color: "#22C55E" }} />
              <div>
                <div className="text-sm text-green-400 font-medium">Agency Verified</div>
                <div className="text-xs text-gray-500">
                  Your agency has been verified. You can post vacancies and recruit tutors.
                </div>
              </div>
            </div>
            {paymentInfo?.paidAt && (
              <p className="text-xs text-gray-600">
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
              <Clock size={18} style={{ color: "#F59E0B" }} />
              <div>
                <div className="text-sm text-yellow-400 font-medium">Payment Processing</div>
                <div className="text-xs text-gray-500">
                  Your payment is being processed. This may take a few minutes.
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              Refresh Status
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Pay a one-time entrance fee to get verified and start posting vacancies.
            </p>
            <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
              <div>
                <div className="text-sm text-white">Entrance Fee</div>
                <div className="text-xs text-gray-500">One-time payment, non-refundable unless rejected</div>
              </div>
              <span className="text-lg font-bold text-green-400">5,000 ETB</span>
            </div>
            <button
              onClick={handlePayEntrance}
              disabled={paying}
              className="w-full px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "#22C55E", color: "black" }}
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
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} style={{ color: "#A855F7" }} />
          <h2 className="text-sm font-medium text-gray-300">Billing & Subscription</h2>
        </div>

        <div className="rounded-xl px-4 py-3" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white">Free Plan</div>
              <div className="text-xs text-gray-500">Limited vacancies and features</div>
            </div>
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
            >
              Active
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          Upgrade to Professional for unlimited vacancies, applicant management, and analytics.
          Coming soon.
        </p>
      </section>

      {/* Danger Zone */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-500 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} style={{ color: "#EF4444" }} />
          <h2 className="text-sm font-medium text-gray-300">Danger Zone</h2>
        </div>

        <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
          <div>
            <div className="text-sm text-white">Sign Out</div>
            <div className="text-xs text-gray-500">Sign out of your account on this device.</div>
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
