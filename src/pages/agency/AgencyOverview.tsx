import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { agencyApi } from "@/lib/api";
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
  onTabChange?: (tab: AgencyTab) => void;
}

export default function AgencyOverview({ onTabChange }: OverviewProps) {
  const { getAgencyVacancies, agencyOrganization } = useData();
  const { ref, inView } = useInView();
  const [applicants, setApplicants] = useState<any[]>([]);

  useEffect(() => {
    agencyApi.getApplicants().then(setApplicants).catch(() => {});
  }, []);

  const myVacancies = getAgencyVacancies();
  const openVacancies = myVacancies.filter((v) => v.status === "open");

  const totalApplicants = applicants.length;
  const shortlisted = applicants.filter((a: any) => a.status === "shortlisted").length;
  const pending = applicants.filter((a: any) => a.status === "applied" || a.status === "under_review").length;

  // Recent applications
  const recentApps = [...applicants].sort((a: any, b: any) => (b.appliedAt || b.applied_at || "").localeCompare(a.appliedAt || a.applied_at || "")).slice(0, 5);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Agency Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Manage your vacancies and recruitment for {agencyOrganization.name}.
        </p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { label: "Open Vacancies", value: openVacancies.length, icon: Briefcase, color: "var(--accent)", tab: "vacancies" as AgencyTab },
          { label: "Total Applicants", value: totalApplicants, icon: Users, color: "var(--badge-info-color)", tab: "applicants" as AgencyTab },
          { label: "Shortlisted", value: shortlisted, icon: CheckCircle2, color: "var(--badge-purple-color)", tab: "applicants" as AgencyTab },
          { label: "Pending Review", value: pending, icon: Clock, color: "var(--badge-pending-color)", tab: "applicants" as AgencyTab },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => onTabChange?.(card.tab)}
              className={`text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-faint)]" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{card.label}</div>
            </button>
          );
        })}
      </div>

      {/* Recent Applications */}
      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[var(--text-secondary)]">Recent Applications</h2>
          <button
            onClick={() => onTabChange?.("applicants")}
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            View all →
          </button>
        </div>

        {recentApps.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <Send size={28} className="mx-auto mb-2 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No applications received yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentApps.map((app, i) => {
              const statusColor = getStatusColor(app.status);
              return (
                <div
                  key={app.id}
                  className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`}
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {app.tutorName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{app.tutorName || app.tutor_name || "Unknown"}</div>
                      <div className="text-xs text-[var(--text-muted)]">{app.vacancyTitle || app.vacancy_title || "Unknown"}</div>
                      <div className="text-xs text-[var(--text-faint)] mt-0.5">Applied {app.appliedAt || app.applied_at}</div>
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
    applied: "var(--text-secondary)", under_review: "var(--badge-info-color)", shortlisted: "var(--accent)",
    interview: "var(--badge-purple-color)", accepted: "var(--accent)", rejected: "var(--danger-color)", withdrawn: "var(--text-muted)",
  };
  return map[status] ?? "var(--text-secondary)";
}
