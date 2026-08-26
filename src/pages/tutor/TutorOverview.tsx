import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  FileText,
  Briefcase,
  ShieldCheck,
  Send,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { TutorTab } from "@/components/layout/TutorSidebar";

interface OverviewProps {
  onTabChange: (tab: TutorTab) => void;
}

const STAT_CARDS = [
  { key: "verification", label: "Verification", icon: ShieldCheck, tab: "verification" as TutorTab },
  { key: "vacancies", label: "Vacancies", icon: Briefcase, tab: "vacancies" as TutorTab },
  { key: "applications", label: "Applications", icon: Send, tab: "applications" as TutorTab },
  { key: "documents", label: "Documents", icon: FileText, tab: "documents" as TutorTab },
];

const VERIFICATION_INFO: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  verified: { label: "Fully Verified", color: "#22C55E", icon: CheckCircle2 },
  partial: { label: "Partially Verified", color: "#F59E0B", icon: Clock },
  unverified: { label: "Unverified", color: "#6B7280", icon: AlertCircle },
  suspended: { label: "Suspended", color: "#EF4444", icon: AlertCircle },
};

export default function TutorOverview({ onTabChange }: OverviewProps) {
  const { tutorProfile, documents, applications, verificationRequest } = useMockData();
  const { ref, inView } = useInView();

  const verifiedDocs = documents.filter((d) => d.status === "verified").length;
  const pendingDocs = documents.filter((d) => d.status === "pending" || d.status === "under_review").length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;

  const vLevel = tutorProfile?.verificationLevel ?? "unverified";
  const vInfo = VERIFICATION_INFO[vLevel];

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Welcome */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, {tutorProfile?.headline ? `${tutorProfile.headline}` : "Tutor"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Here's an overview of your tutoring profile and activity.
        </p>
      </div>

      {/* Verification Banner */}
      <div
        className={`rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{
          background: vLevel === "verified" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.08)",
          border: `1px solid ${vLevel === "verified" ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.2)"}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${vInfo.color}20` }}
        >
          <vInfo.icon size={20} style={{ color: vInfo.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-white">{vInfo.label}</span>
            {vLevel === "partial" && (
              <span className="text-xs text-gray-400">
                — {verifiedDocs}/{documents.length} documents verified
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            {vLevel === "verified"
              ? "Your profile is fully verified. You can apply to vacancies with confidence."
              : vLevel === "partial"
              ? "Complete your document verification to unlock your full verified badge."
              : "Upload your credentials and request verification to get started."}
          </p>
        </div>
        {vLevel !== "verified" && (
          <button
            onClick={() => onTabChange("verification")}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0"
            style={{
              background: vLevel === "partial" ? "#22C55E" : "rgba(34,197,94,0.15)",
              color: vLevel === "partial" ? "black" : "#22C55E",
              border: vLevel === "partial" ? "none" : "1px solid rgba(34,197,94,0.3)",
            }}
          >
            {verificationRequest ? "View Status" : "Request Verification"}
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => {
          const Icon = card.icon;
          let value = "0";
          let sub = "";
          if (card.key === "verification") {
            value = `${verifiedDocs}`;
            sub = `${documents.length} total docs`;
          } else if (card.key === "vacancies") {
            value = "6";
            sub = "Open positions";
          } else if (card.key === "applications") {
            value = `${applications.length}`;
            sub = `${shortlisted} shortlisted`;
          } else if (card.key === "documents") {
            value = `${verifiedDocs}`;
            sub = `${pendingDocs} pending`;
          }
          return (
            <button
              key={card.key}
              onClick={() => onTabChange(card.tab)}
              className={`text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${(i + 2) * 100} ${inView ? "in-view" : ""}`}
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.12)" }}
                >
                  <Icon size={18} style={{ color: "#22C55E" }} />
                </div>
                <ArrowUpRight size={14} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{sub}</div>
            </button>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <h2 className="text-sm font-medium text-gray-400 mb-4">Recent Applications</h2>
        <div className="space-y-2">
          {applications.slice(0, 3).map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div>
                <div className="text-sm font-medium text-white">{app.vacancyTitle}</div>
                <div className="text-xs text-gray-500">{app.organizationName}</div>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
          {applications.length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">No applications yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { bg: string; color: string; label: string }> = {
    applied: { bg: "rgba(107,114,128,0.15)", color: "#9CA3AF", label: "Applied" },
    under_review: { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", label: "Under Review" },
    shortlisted: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80", label: "Shortlisted" },
    interview: { bg: "rgba(168,85,247,0.15)", color: "#C084FC", label: "Interview" },
    accepted: { bg: "rgba(34,197,94,0.2)", color: "#22C55E", label: "Accepted" },
    rejected: { bg: "rgba(239,68,68,0.15)", color: "#F87171", label: "Rejected" },
    withdrawn: { bg: "rgba(107,114,128,0.1)", color: "#6B7280", label: "Withdrawn" },
  };
  const s = MAP[status] ?? MAP.applied;
  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
