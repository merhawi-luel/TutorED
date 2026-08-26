import { useState } from "react";
import AgencySidebar, { type AgencyTab } from "@/components/layout/AgencySidebar";
import AgencyOverview from "./AgencyOverview";
import AgencyVacancies from "./AgencyVacancies";
import AgencyApplicants from "./AgencyApplicants";
import AgencyTutors from "./AgencyTutors";
import AgencyOrganization from "./AgencyOrganization";
import { useMockData } from "@/context/MockDataContext";

const TAB_COMPONENTS: Record<AgencyTab, React.ComponentType<{ onTabChange?: (tab: AgencyTab) => void }>> = {
  overview: AgencyOverview,
  vacancies: AgencyVacancies,
  applicants: AgencyApplicants,
  tutors: AgencyTutors,
  organization: AgencyOrganization,
  settings: AgencyOverview, // Placeholder
};

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("overview");
  const { agencyOrganization } = useMockData();

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
