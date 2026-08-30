import { useState } from "react";
import ParentSidebar, { type ParentTab } from "@/components/layout/ParentSidebar";
import ParentOverview from "./ParentOverview";
import ParentProfile from "./ParentProfile";
import ParentRecruitment from "./ParentRecruitment";
import ParentVacancies from "./ParentVacancies";
import ParentRequests from "./ParentRequests";
import ParentSettings from "./ParentSettings";

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState<ParentTab>("overview");

  const renderPage = () => {
    switch (activeTab) {
      case "overview":
        return <ParentOverview />;
      case "profile":
        return <ParentProfile />;
      case "recruitment":
        return <ParentRecruitment />;
      case "vacancies":
        return <ParentVacancies />;
      case "requests":
        return <ParentRequests />;
      case "settings":
        return <ParentSettings />;
      default:
        return <ParentOverview />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "#000000" }}>
      <ParentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
