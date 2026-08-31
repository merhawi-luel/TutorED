import { useState } from "react";
import AdminSidebar, { type AdminTab } from "@/components/layout/AdminSidebar";
import AdminOverview from "./AdminOverview";
import AdminVerifications from "./AdminVerifications";
import AdminDocuments from "./AdminDocuments";
import AdminEducation from "./AdminEducation";
import AdminTutors from "./AdminTutors";
import AdminAgencies from "./AdminAgencies";
import AdminAdmins from "./AdminAdmins";
import AdminSettings from "./AdminSettings";

const TAB_COMPONENTS: Record<AdminTab, React.ComponentType<{ onTabChange?: (tab: AdminTab) => void }>> = {
  overview: AdminOverview,
  verifications: AdminVerifications,
  documents: AdminDocuments,
  education: AdminEducation,
  tutors: AdminTutors,
  agencies: AdminAgencies,
  admins: AdminAdmins,
  settings: AdminSettings,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const Page = TAB_COMPONENTS[activeTab];

  return (
    <div className="flex min-h-screen" style={{ background: "#000000" }}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto">
        <Page onTabChange={setActiveTab} />
      </main>
    </div>
  );
}
