import { useState, useEffect } from "react";
import { CreditCard, Clock } from "lucide-react";
import AgencySidebar, { type AgencyTab } from "@/components/layout/AgencySidebar";
import AgencyOverview from "./AgencyOverview";
import AgencyVacancies from "./AgencyVacancies";
import AgencyApplicants from "./AgencyApplicants";
import AgencyTutors from "./AgencyTutors";
import AgencyOrganization from "./AgencyOrganization";
import AgencyRequests from "./AgencyRequests";
import AgencySettings from "./AgencySettings";
import AgencySetup from "./AgencySetup";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

const TAB_COMPONENTS: Record<AgencyTab, React.ComponentType<{ onTabChange?: (tab: AgencyTab) => void }>> = {
  overview: AgencyOverview,
  vacancies: AgencyVacancies,
  applicants: AgencyApplicants,
  requests: AgencyRequests,
  tutors: AgencyTutors,
  organization: AgencyOrganization,
  settings: AgencySettings,
};

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface PaymentInfo {
  paymentStatus: string;
  txRef: string | null;
  paidAt: string | null;
  isVerified: boolean;
}

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("overview");
  const { agencyOrganization, loading } = useData();
  const { user } = useAuth();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const hasOrganization = agencyOrganization.id !== "";
  const isPaid = paymentInfo?.paymentStatus === "paid";
  const isPending = paymentInfo?.paymentStatus === "pending";

  // Fetch payment status
  useEffect(() => {
    if (!hasOrganization) {
      setPaymentLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/payment/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
  }, [hasOrganization]);

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
      console.error("Payment error:", err);
      alert(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  const handleSetupComplete = () => {
    // DataContext will automatically update, triggering re-render
  };

  // Show loading state
  if (loading || paymentLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show setup if no organization
  if (!hasOrganization) {
    return <AgencySetup onComplete={handleSetupComplete} />;
  }

  // Gate dashboard behind payment
  if (!isPaid) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
      >
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">Agency Entrance Fee</h1>
            <p className="text-gray-400 mb-2">Pay a one-time entrance fee of</p>
            <p className="text-4xl font-bold text-green-400 mb-6">5,000 ETB</p>

            <p className="text-sm text-gray-500 mb-8">
              After payment, your agency will be automatically verified and you can start posting vacancies.
            </p>

            {isPending ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Clock className="w-5 h-5" />
                  <span>Payment processing...</span>
                </div>
                <p className="text-sm text-gray-500">
                  This may take a few minutes. You can refresh this page to check status.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            ) : (
              <button
                onClick={handlePayEntrance}
                disabled={paying}
                className="w-full px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
              >
                {paying ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </span>
                ) : (
                  "Pay Entrance Fee"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show normal dashboard
  const Page = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: "#000000" }}>
      <AgencySidebar activeTab={activeTab} onTabChange={setActiveTab} orgName={agencyOrganization.name} />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Page onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
