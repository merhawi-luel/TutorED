import { useState } from "react";
import ParentSidebar, { type ParentTab } from "@/components/layout/ParentSidebar";
import { useTheme } from "@/context/ThemeContext";
import ParentOverview from "./ParentOverview";
import ParentProfile from "./ParentProfile";
import ParentRecruitment from "./ParentRecruitment";
import ParentVacancies from "./ParentVacancies";
import ParentApplicants from "./ParentApplicants";
import ParentVacancyApplicants from "./ParentVacancyApplicants";
import ParentRequests from "./ParentRequests";
import ParentSettings from "./ParentSettings";

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<ParentTab>("overview");
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const { colors } = useTheme();

  const renderPage = () => {
    if (selectedVacancyId) {
      return (
        <ParentVacancyApplicants
          vacancyId={selectedVacancyId}
          onBack={() => setSelectedVacancyId(null)}
        />
      );
    }

    switch (activeTab) {
      case "overview":
        return <ParentOverview />;
      case "profile":
        return <ParentProfile />;
      case "recruitment":
        return <ParentRecruitment />;
      case "vacancies":
        return (
          <ParentVacancies
            onBrowseApplicants={(vacancyId) => setSelectedVacancyId(vacancyId)}
          />
        );
      case "applicants":
        return <ParentApplicants />;
      case "requests":
        return <ParentRequests />;
      case "settings":
        return <ParentSettings />;
      default:
        return <ParentOverview />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: colors.bgPage }}>
      <ParentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
