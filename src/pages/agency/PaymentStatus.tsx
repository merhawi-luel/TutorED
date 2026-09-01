import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { CheckCircle, Clock, XCircle, Upload, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function PaymentStatus() {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [status, setStatus] = useState<"loading" | "pending" | "verified" | "unverified">("loading");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
          setMessage("Your agency is verified! You can now post vacancies.");
          setTimeout(() => navigate("/agency"), 3000);
        } else if (data.verificationStatus === "pending") {
          setStatus("pending");
          setMessage("Your receipt is under review. Please wait for admin approval.");
        } else {
          setStatus("unverified");
          setMessage("Please upload your payment receipt for verification.");
        }
      } catch (error) {
        console.error("Status check error:", error);
        setStatus("unverified");
        setMessage("Please upload your payment receipt to get verified.");
      }
    };

    fetchStatus();
  }, [navigate]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
      if (!validTypes.includes(selectedFile.type)) {
        setMessage("Please upload a PNG, JPG, or PDF file.");
        return;
      }
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage("File must be smaller than 5MB.");
        return;
      }
      setFile(selectedFile);
      setMessage("");
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64
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
            description: "Agency payment verification receipt",
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        setStatus("pending");
        setMessage("Receipt uploaded successfully! Admin will review and verify your agency.");
        setFile(null);
        setUploading(false);

        // Poll for verification approval
        setTimeout(() => {
          const checkApproval = async () => {
            const pollHeaders = await getAuthHeaders();
            const checkResponse = await fetch(`${API_BASE}/payment/status`, {
              headers: pollHeaders,
            });

            if (checkResponse.ok) {
              const checkData = await checkResponse.json();
              if (checkData.isVerified) {
                setStatus("verified");
                setMessage("Your agency is verified! Redirecting to dashboard...");
                setTimeout(() => navigate("/agency"), 2000);
              }
            }
          };

          // Check every 10 seconds for 24 hours
          const interval = setInterval(checkApproval, 10000);
          setTimeout(() => clearInterval(interval), 24 * 60 * 60 * 1000);
        }, 1000);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
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
      title: "Under Review",
      bgColor: "from-yellow-900/20 to-black",
    },
    verified: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Verified!",
      bgColor: "from-green-900/20 to-black",
    },
    unverified: {
      icon: <Upload className="w-16 h-16" style={{ color: colors.accent }} />,
      title: "Verification Required",
      bgColor: "from-purple-900/20 to-black",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${config.bgColor}`}
      style={{ backgroundColor: colors.bgPage }}
    >
      <div className="max-w-md w-full mx-4">
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
        >
          <button
            onClick={() => navigate("/agency")}
            className="mb-6 flex items-center gap-2 text-sm"
            style={{ color: colors.accent }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex justify-center mb-6">{config.icon}</div>

          <h1 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>
            {config.title}
          </h1>

          <p style={{ color: colors.textSecondary }} className="mb-6">
            {message}
          </p>

          {(status === "unverified" || status === "pending") && (
            <div
              className="rounded-lg p-4 mb-6 border"
              style={{ backgroundColor: colors.bgInput, borderColor: colors.borderColor }}
            >
              <div className="mb-4">
                <label
                  className="block text-sm mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Upload Payment Receipt or Screenshot
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  disabled={uploading || status === "pending"}
                  className="w-full px-3 py-2 rounded border text-sm"
                  style={{
                    backgroundColor: colors.bgPage,
                    borderColor: colors.borderColor,
                    color: colors.textPrimary,
                  }}
                />
                <p style={{ color: colors.textMuted }} className="text-xs mt-1">
                  PNG, JPG, or PDF (max 5MB)
                </p>
              </div>

              {file && (
                <p style={{ color: colors.textSecondary }} className="text-sm mb-4">
                  Selected: {file.name}
                </p>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading || status === "pending"}
                className="w-full py-2 rounded font-medium transition-colors"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.bgPage,
                  opacity: !file || uploading || status === "pending" ? 0.5 : 1,
                  cursor: !file || uploading || status === "pending" ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? "Uploading..." : "Upload Receipt"}
              </button>
            </div>
          )}

          {status === "verified" && (
            <p style={{ color: "rgb(34, 197, 94)" }} className="text-sm mb-4">
              Redirecting to dashboard...
            </p>
          )}

          <button
            onClick={() => navigate("/agency")}
            className="w-full py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: colors.borderColor,
              color: colors.textPrimary,
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
