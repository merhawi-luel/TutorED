import { useState } from "react";
import AgencySidebar, { type AgencyTab } from "@/components/layout/AgencySidebar";
import { useTheme } from "@/context/ThemeContext";
import AgencyOverview from "./AgencyOverview";
import AgencyVacancies from "./AgencyVacancies";
import AgencyMyPosts from "./AgencyMyPosts";
import AgencyVerification from "./AgencyVerification";
import AgencyApplicants from "./AgencyApplicants";
import AgencyOrganization from "./AgencyOrganization";
import AgencyRequests from "./AgencyRequests";
import AgencySettings from "./AgencySettings";
import AgencySetup from "./AgencySetup";
import { useData } from "@/context/DataContext";

const TAB_COMPONENTS: Record<AgencyTab, React.ComponentType<{ onTabChange?: (tab: AgencyTab) => void }>> = {
  overview: AgencyOverview,
  vacancies: AgencyVacancies,
  "my-posts": AgencyMyPosts,
  verification: AgencyVerification,
  applicants: AgencyApplicants,
  requests: AgencyRequests,
  organization: AgencyOrganization,
  settings: AgencySettings,
};

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("overview");
  const { agencyOrganization, loading } = useData();
  const { colors } = useTheme();

  const hasOrganization = agencyOrganization.id !== "";

  const handleSetupComplete = () => {};

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: colors.bgPage }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
          ></div>
          <p style={{ color: colors.textSecondary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasOrganization) {
    return <AgencySetup onComplete={handleSetupComplete} />;
  }

  const Page = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: colors.bgPage }}>
      <AgencySidebar activeTab={activeTab} onTabChange={setActiveTab} orgName={agencyOrganization.name} />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Page onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
