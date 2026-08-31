import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import { useState } from "react";
import {
  Send,
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import type { ApplicationStatus } from "@/types";

const STATUS_CONFIG: Record<ApplicationStatus, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
  applied: { icon: Send, color: "#9CA3AF", label: "Applied", bg: "rgba(107,114,128,0.12)" },
  under_review: { icon: Eye, color: "#60A5FA", label: "Under Review", bg: "rgba(59,130,246,0.12)" },
  shortlisted: { icon: CheckCircle2, color: "#4ADE80", label: "Shortlisted", bg: "rgba(34,197,94,0.12)" },
  interview: { icon: MessageSquare, color: "#C084FC", label: "Interview", bg: "rgba(168,85,247,0.12)" },
  accepted: { icon: CheckCircle2, color: "#22C55E", label: "Accepted", bg: "rgba(34,197,94,0.18)" },
  rejected: { icon: XCircle, color: "#F87171", label: "Rejected", bg: "rgba(239,68,68,0.12)" },
  withdrawn: { icon: XCircle, color: "#6B7280", label: "Withdrawn", bg: "rgba(107,114,128,0.08)" },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export default function TutorApplications() {
  const { applications } = useData();
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const total = applications.length;
  const shortlisted = applications.filter((a) => a.status === "shortlisted").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const accepted = applications.filter((a) => a.status === "accepted").length;

  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const cardBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const textPrimary = isDark ? "#FFFFFF" : "#0F172A";
  const textSecondary = isDark ? "#9CA3AF" : "#475569";
  const textMuted = isDark ? "#6B7280" : "#94A3B8";
  const pillBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const pillBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>Applications</h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>Track your job applications and their status.</p>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { label: "Total", value: total, color: "#9CA3AF" },
          { label: "Shortlisted", value: shortlisted, color: "#4ADE80" },
          { label: "Interviews", value: interviews, color: "#C084FC" },
          { label: "Accepted", value: accepted, color: "#22C55E" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex gap-1.5 flex-wrap fade-up delay-200 ${inView ? "in-view" : ""}`}>
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f.value ? "rgba(34,197,94,0.15)" : pillBg,
              border: `1px solid ${filter === f.value ? "rgba(34,197,94,0.3)" : pillBorder}`,
              color: filter === f.value ? "#22C55E" : textSecondary,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Application List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <Send size={32} className="mx-auto mb-3" style={{ color: textMuted }} />
            <p className="text-sm" style={{ color: textSecondary }}>
              {applications.length === 0
                ? "You haven't applied to any vacancies yet."
                : "No applications match this filter."}
            </p>
          </div>
        ) : (
          filtered.map((app, i) => {
            const cfg = STATUS_CONFIG[app.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={app.id}
                className={`rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:-translate-y-1 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <Briefcase size={18} style={{ color: "#22C55E" }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>{app.vacancyTitle}</h3>
                    <div className="text-xs" style={{ color: textMuted }}>{app.organizationName}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: textFaint }}>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> Applied {app.appliedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowUpRight size={11} /> Updated {app.updatedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <StatusIcon size={13} />
                    {cfg.label}
                  </span>
                  {app.status === "applied" && (
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const textFaint = "#4B5563";
