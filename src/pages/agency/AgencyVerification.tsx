import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, XCircle, Upload, AlertCircle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function AgencyVerification() {
  const { colors } = useTheme();
  const { agencyOrganization } = useData();

  const [status, setStatus] = useState<"loading" | "pending" | "verified" | "unverified">("loading");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [orgInfo, setOrgInfo] = useState<{
    name: string;
    email: string;
    phone: string;
    bankAccount: string;
  }>({
    name: agencyOrganization.name || "",
    email: "",
    phone: "",
    bankAccount: "",
  });

  // Fetch verification status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/payment/status`, { headers });

        if (!response.ok) {
          throw new Error("Failed to check status");
        }

        const data = await response.json();

        if (data.isVerified) {
          setStatus("verified");
          setMessage("✅ Your organization is verified! You can post vacancies now.");
        } else if (data.verificationStatus === "pending") {
          setStatus("pending");
          setMessage(
            "⏳ Your verification is under review by our admin team. We'll notify you when it's approved."
          );
        } else {
          setStatus("unverified");
          setMessage(
            "Please complete your organization verification by uploading your payment receipt."
          );
        }
      } catch (error) {
        console.error("Status check error:", error);
        setStatus("unverified");
        setMessage("Please upload your payment receipt to get verified.");
      }
    };

    fetchStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage("❌ Please upload a PNG, JPG, or PDF file.");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage("❌ File must be smaller than 5MB.");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("❌ Please select a file first.");
      return;
    }

    if (!orgInfo.email || !orgInfo.phone) {
      setMessage("❌ Please fill in email and phone number.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(",")[1] || "";

        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/payment/upload-receipt`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            description: `Verification receipt for ${orgInfo.name}. Contact: ${orgInfo.email}, ${orgInfo.phone}`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        setStatus("pending");
        setMessage("✅ Receipt uploaded! Our team will review it within 24 hours.");
        setFile(null);
        setOrgInfo({ ...orgInfo, email: "", phone: "", bankAccount: "" });
        setUploading(false);

        // Poll for verification approval
        const interval = setInterval(async () => {
          const pollHeaders = await getAuthHeaders();
          const checkResponse = await fetch(`${API_BASE}/payment/status`, {
            headers: pollHeaders,
          });

          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            if (checkData.isVerified) {
              setStatus("verified");
              setMessage("✅ Your organization is verified! You can now post vacancies.");
              clearInterval(interval);
            }
          }
        }, 10000);

        setTimeout(() => clearInterval(interval), 24 * 60 * 60 * 1000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(
        "❌ " +
        (error instanceof Error ? error.message : "Upload failed. Please try again.")
      );
      setUploading(false);
    }
  };

  const statusConfig = {
    loading: {
      icon: <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />,
      title: "Loading...",
      bgColor: "from-yellow-900/20 to-black",
    },
    pending: {
      icon: <Clock className="w-16 h-16" style={{ color: colors.accent }} />,
      title: "Verification Pending",
      bgColor: "from-yellow-900/20 to-black",
    },
    verified: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Organization Verified ✓",
      bgColor: "from-green-900/20 to-black",
    },
    unverified: {
      icon: <Upload className="w-16 h-16" style={{ color: colors.accent }} />,
      title: "Verify Your Organization",
      bgColor: "from-purple-900/20 to-black",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          Organization Verification
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Complete your verification to start posting job vacancies
        </p>
      </div>

      {/* Status Card */}
      <div
        className="rounded-2xl border p-8 text-center"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.borderColor,
          background: `linear-gradient(135deg, ${colors.bgCard} 0%, ${colors.bgInput} 100%)`,
        }}
      >
        <div className="flex justify-center mb-6">{config.icon}</div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textPrimary }}>
          {config.title}
        </h2>

        <p style={{ color: colors.textSecondary }} className="mb-6">
          {message}
        </p>

        {/* Verified Badge */}
        {status === "verified" && (
          <div
            className="rounded-xl p-4 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "rgb(34, 197, 94)",
            }}
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">
              You can now post vacancies and recruit tutors!
            </span>
          </div>
        )}

        {/* Upload Form */}
        {(status === "unverified" || status === "pending") && (
          <div
            className="rounded-xl p-6 space-y-4 mt-6 border"
            style={{
              backgroundColor: colors.bgInput,
              borderColor: colors.borderColor,
            }}
          >
            <div className="text-left">
              <label className="block text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
                Organization Information
              </label>

              {/* Organization Name (readonly) */}
              <div className="mb-4">
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgInfo.name}
                  disabled
                  className="w-full px-3 py-2 rounded border text-sm opacity-50"
                  style={{
                    backgroundColor: colors.bgPage,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={orgInfo.email}
                  onChange={(e) => setOrgInfo({ ...orgInfo, email: e.target.value })}
                  placeholder="contact@organization.com"
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: colors.bgPage,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={orgInfo.phone}
                  onChange={(e) => setOrgInfo({ ...orgInfo, phone: e.target.value })}
                  placeholder="+251 9XX XXX XXXX"
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: colors.bgPage,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Bank Account */}
              <div className="mb-4">
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>
                  Bank Account / Payment Method
                </label>
                <input
                  type="text"
                  value={orgInfo.bankAccount}
                  onChange={(e) => setOrgInfo({ ...orgInfo, bankAccount: e.target.value })}
                  placeholder="e.g., Commercial Bank AC: 12345678 (optional)"
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: colors.bgPage,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              {/* Receipt Upload */}
              <label className="block text-sm font-medium mb-3" style={{ color: colors.textPrimary }}>
                Payment Receipt *
              </label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center transition-colors"
                style={{
                  borderColor: file ? colors.accent : colors.borderColor,
                  backgroundColor: file ? `${colors.accent}10` : colors.bgPage,
                }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading || status === "pending"}
                  className="hidden"
                  id="receipt-input"
                />
                <label
                  htmlFor="receipt-input"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload size={24} style={{ color: colors.accent }} />
                  <span style={{ color: colors.textSecondary }} className="text-sm font-medium">
                    {file ? file.name : "Click to upload or drag & drop"}
                  </span>
                  <span style={{ color: colors.textMuted }} className="text-xs">
                    PNG, JPG, or PDF (max 5MB)
                  </span>
                </label>
              </div>

              {/* Info Box */}
              <div
                className="rounded-lg p-3 mt-4 flex gap-3 text-sm"
                style={{
                  backgroundColor: `${colors.accent}15`,
                  border: `1px solid ${colors.accent}40`,
                  color: colors.textSecondary,
                }}
              >
                <AlertCircle size={18} style={{ color: colors.accent, flexShrink: 0 }} />
                <div>
                  <p className="font-medium mb-1" style={{ color: colors.textPrimary }}>
                    What to upload:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Bank transfer receipt or confirmation</li>
                    <li>Payment screenshot showing 5,000 ETB</li>
                    <li>Invoice or official payment proof</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading || status === "pending" || !orgInfo.email || !orgInfo.phone}
              className="w-full py-3 rounded-lg font-medium transition-all mt-6"
              style={{
                backgroundColor: colors.accent,
                color: colors.bgPage,
                opacity:
                  !file || uploading || status === "pending" || !orgInfo.email || !orgInfo.phone
                    ? 0.5
                    : 1,
                cursor:
                  !file || uploading || status === "pending" || !orgInfo.email || !orgInfo.phone
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {uploading ? "Uploading Receipt..." : "Submit for Verification"}
            </button>
          </div>
        )}

        {/* Timeline Info */}
        <div className="mt-8 space-y-3 text-left">
          <p style={{ color: colors.textMuted }} className="text-xs font-medium uppercase tracking-wide">
            Verification Timeline
          </p>
          <div className="space-y-2">
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: colors.accent, color: colors.bgPage }}
              >
                1
              </div>
              <div>
                <p style={{ color: colors.textPrimary }} className="text-sm font-medium">
                  Upload Receipt
                </p>
                <p style={{ color: colors.textMuted }} className="text-xs">
                  Submit your payment proof and organization details
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor:
                    status === "pending" || status === "verified" ? colors.accent : colors.borderColor,
                  color: colors.bgPage,
                }}
              >
                2
              </div>
              <div>
                <p style={{ color: colors.textPrimary }} className="text-sm font-medium">
                  Admin Review (24hrs)
                </p>
                <p style={{ color: colors.textMuted }} className="text-xs">
                  Our team verifies your payment and organization details
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  backgroundColor: status === "verified" ? colors.accent : colors.borderColor,
                  color: colors.bgPage,
                }}
              >
                3
              </div>
              <div>
                <p style={{ color: colors.textPrimary }} className="text-sm font-medium">
                  Start Recruiting
                </p>
                <p style={{ color: colors.textMuted }} className="text-xs">
                  Post vacancies and find top tutors for your organization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
