import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  Briefcase,
  Send,
  CheckCircle2,
  Clock,
  Users,
  ArrowUpRight,
} from "lucide-react";
import type { AgencyTab } from "@/components/layout/AgencySidebar";

interface OverviewProps {
  onTabChange: (tab: AgencyTab) => void;
}

export default function AgencyOverview({ onTabChange }: OverviewProps) {
  const { getAgencyVacancies, getVacancyApplicants, agencyOrganization } = useMockData();
  const { ref, inView } = useInView();

  const myVacancies = getAgencyVacancies();
  const openVacancies = myVacancies.filter((v) => v.status === "open");

  // Get all applicants across all agency vacancies
  const allApplicants = myVacancies.flatMap((v) => getVacancyApplicants(v.id));
  const totalApplicants = allApplicants.length;
  const shortlisted = allApplicants.filter((a) => a.status === "shortlisted").length;
  const pending = allApplicants.filter((a) => a.status === "applied" || a.status === "under_review").length;

  // Recent applications
  const recentApps = [...allApplicants].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)).slice(0, 5);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Agency Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your vacancies and recruitment for {agencyOrganization.name}.
        </p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { label: "Open Vacancies", value: openVacancies.length, icon: Briefcase, color: "#22C55E", tab: "vacancies" as AgencyTab },
          { label: "Total Applicants", value: totalApplicants, icon: Users, color: "#3B82F6", tab: "applicants" as AgencyTab },
          { label: "Shortlisted", value: shortlisted, icon: CheckCircle2, color: "#A855F7", tab: "applicants" as AgencyTab },
          { label: "Pending Review", value: pending, icon: Clock, color: "#F59E0B", tab: "applicants" as AgencyTab },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onTabChange(card.tab)}
              className={`text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={14} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </button>
          );
        })}
      </div>

      {/* Recent Applications */}
      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-400">Recent Applications</h2>
          <button
            onClick={() => onTabChange("applicants")}
            className="text-xs font-medium transition-colors"
            style={{ color: "#22C55E" }}
          >
            View all →
          </button>
        </div>

        {recentApps.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <Send size={28} className="mx-auto mb-2 text-gray-600" />
            <p className="text-sm text-gray-400">No applications received yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app, i) => {
              const statusColor = getStatusColor(app.status);
              return (
                <div
                  key={app.id}
                  className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`}
                  style={{ background: "#111111", border: "1px solid #1F1F1F" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0"
                      style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                    >
                      {app.tutorName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{app.tutorName}</div>
                      <div className="text-xs text-gray-500">{app.vacancyTitle}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Applied {app.appliedAt}</div>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                    style={{ background: `${statusColor}18`, color: statusColor }}
                  >
                    {app.status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    applied: "#9CA3AF", under_review: "#60A5FA", shortlisted: "#4ADE80",
    interview: "#C084FC", accepted: "#22C55E", rejected: "#F87171", withdrawn: "#6B7280",
  };
  return map[status] ?? "#9CA3AF";
}
