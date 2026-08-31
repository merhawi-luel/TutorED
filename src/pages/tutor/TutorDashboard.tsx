import { useState } from "react";
import Sidebar, { type TutorTab } from "@/components/layout/TutorSidebar";
import { useTheme } from "@/context/ThemeContext";
import TutorOverview from "./TutorOverview";
import TutorProfile from "./TutorProfile";
import TutorDocumentsAndVerification from "./TutorDocumentsAndVerification";
import TutorEducation from "./TutorEducation";
import TutorVacancies from "./TutorVacancies";
import TutorApplications from "./TutorApplications";
import TutorSettings from "./TutorSettings";

const TAB_COMPONENTS: Record<TutorTab, React.ComponentType<{ onTabChange?: (tab: TutorTab) => void }>> = {
  overview: TutorOverview,
  profile: TutorProfile,
  "docs-verification": TutorDocumentsAndVerification,
  education: TutorEducation,
  vacancies: TutorVacancies,
  applications: TutorApplications,
  settings: TutorSettings,
};

export default function TutorDashboard() {
  const [activeTab, setActiveTab] = useState<TutorTab>("overview");
  const { colors } = useTheme();

  const Page = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: colors.bgPage }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Page onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
