import { useState } from "react";
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

const TAB_COMPONENTS: Record<AgencyTab, React.ComponentType<{ onTabChange?: (tab: AgencyTab) => void }>> = {
  overview: AgencyOverview,
  vacancies: AgencyVacancies,
  applicants: AgencyApplicants,
  requests: AgencyRequests,
  tutors: AgencyTutors,
  organization: AgencyOrganization,
  settings: AgencySettings,
};

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("overview");
  const { agencyOrganization, loading } = useData();

  const hasOrganization = agencyOrganization.id !== "";

  const handleSetupComplete = () => {
    // DataContext will automatically update, triggering re-render
  };

  // Show loading state
  if (loading) {
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
