import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const txRef = searchParams.get("tx_ref");

  const [status, setStatus] = useState<"loading" | "pending" | "paid" | "failed">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!txRef) {
      setStatus("failed");
      setMessage("No transaction reference found");
      return;
    }

    // Poll for payment status
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/payment/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to check status");
        }

        const data = await response.json();
        setStatus(data.paymentStatus as "pending" | "paid");

        if (data.paymentStatus === "paid") {
          setMessage("Payment successful! Your agency is now verified.");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => navigate("/agency"), 3000);
        } else if (data.paymentStatus === "pending") {
          setMessage("Payment is being processed. This may take a few minutes.");
        } else {
          setMessage("Payment status: " + data.paymentStatus);
        }
      } catch (error) {
        console.error("Status check error:", error);
        setStatus("failed");
        setMessage("Unable to check payment status. Please try again later.");
      }
    };

    checkStatus();

    // Poll every 5 seconds for 2 minutes
    const interval = setInterval(checkStatus, 5000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [txRef, navigate]);

  const statusConfig = {
    loading: {
      icon: <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />,
      title: "Checking Payment Status...",
      bgColor: "from-yellow-900/20 to-black",
    },
    pending: {
      icon: <Clock className="w-16 h-16 text-yellow-500" />,
      title: "Payment Pending",
      bgColor: "from-yellow-900/20 to-black",
    },
    paid: {
      icon: <CheckCircle className="w-16 h-16 text-green-500" />,
      title: "Payment Successful!",
      bgColor: "from-green-900/20 to-black",
    },
    failed: {
      icon: <XCircle className="w-16 h-16 text-red-500" />,
      title: "Payment Failed",
      bgColor: "from-red-900/20 to-black",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-b ${config.bgColor}`}
    >
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <div className="flex justify-center mb-6">{config.icon}</div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">{config.title}</h1>

          <p className="text-[var(--text-secondary)] mb-6">{message}</p>

          {txRef && (
            <div className="bg-gray-800 rounded-lg p-3 mb-6">
              <p className="text-xs text-[var(--text-muted)]">Transaction Reference</p>
              <p className="text-sm text-gray-300 font-mono break-all">{txRef}</p>
            </div>
          )}

          {status === "paid" && (
            <p className="text-green-400 text-sm mb-4">
              Redirecting to dashboard in a few seconds...
            </p>
          )}

          <button
            onClick={() => navigate("/agency")}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-[var(--text-primary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
