import { useState } from "react";
import Sidebar, { type TutorTab } from "@/components/layout/TutorSidebar";
import TutorOverview from "./TutorOverview";
import TutorProfile from "./TutorProfile";
import TutorDocuments from "./TutorDocuments";
import TutorVerification from "./TutorVerification";
import TutorEducation from "./TutorEducation";
import TutorVacancies from "./TutorVacancies";
import TutorApplications from "./TutorApplications";
import TutorSettings from "./TutorSettings";

const TAB_COMPONENTS: Record<TutorTab, React.ComponentType<{ onTabChange?: (tab: TutorTab) => void }>> = {
  overview: TutorOverview,
  profile: TutorProfile,
  documents: TutorDocuments,
  verification: TutorVerification,
  education: TutorEducation,
  vacancies: TutorVacancies,
  applications: TutorApplications,
  settings: TutorSettings,
};

export default function TutorDashboard() {
  const [activeTab, setActiveTab] = useState<TutorTab>("overview");

  const Page = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: "#000000" }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Page onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
