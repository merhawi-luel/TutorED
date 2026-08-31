import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { adminApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Users, Building2, ShieldCheck, FileText, Briefcase, Clock, CheckCircle2, ArrowUpRight,
} from "lucide-react";
import type { AdminTab } from "@/components/layout/AdminSidebar";

interface OverviewProps {
  onTabChange?: (tab: AdminTab) => void;
}

export default function AdminOverview({ onTabChange }: OverviewProps) {
  const { allVerificationRequests, allOrganizations, getUserName } = useData();
  const { colors, isDark } = useTheme();
  const { ref, inView } = useInView();
  const [tutors, setTutors] = useState<any[]>([]);
  const [tutorProfiles, setTutorProfiles] = useState<any[]>([]);
  const [allDocs, setAllDocs] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getTutors().then((data) => {
      setTutors(data);
      setTutorProfiles(data.filter((t: any) => t.headline !== undefined));
    }).catch(() => {});
    adminApi.getVerifications().then((data) => {
      setAllDocs(data.flatMap((vr: any) => (vr.documents || [])));
    }).catch(() => {});
  }, []);

  const pendingVerifications = allVerificationRequests.filter((vr) => vr.status === "pending" || vr.status === "under_review");
  const pendingDocs = allDocs.filter((d: any) => d.status === "pending" || d.status === "under_review");
  const verifiedTutors = tutorProfiles.filter((p: any) => (p.verificationLevel || p.verification_level) === "verified");

  const cs: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Platform overview and verification management.</p>
      </div>

      <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { label: "Total Tutors", value: tutors.length, icon: Users, color: "var(--accent)", tab: "tutors" as AdminTab },
          { label: "Verified Tutors", value: verifiedTutors.length, icon: CheckCircle2, color: "var(--accent)", tab: "tutors" as AdminTab },
          { label: "Pending Verifications", value: pendingVerifications.length, icon: Clock, color: "var(--badge-pending-color)", tab: "verifications" as AdminTab },
          { label: "Agencies", value: allOrganizations.length, icon: Building2, color: "var(--badge-info-color)", tab: "agencies" as AdminTab },
          { label: "Pending Documents", value: pendingDocs.length, icon: FileText, color: "var(--badge-pending-color)", tab: "documents" as AdminTab },
          { label: "Open Vacancies", value: 6, icon: Briefcase, color: "var(--badge-purple-color)", tab: "agencies" as AdminTab },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <button key={card.label} onClick={() => onTabChange?.(card.tab)}
              className={`text-left rounded-xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
              style={cs}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${card.color}18` }}>
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={14} style={{ color: colors.textFaint }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>{card.value}</div>
              <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{card.label}</div>
            </button>
          );
        })}
      </div>

      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: colors.textSecondary }}>Pending Verification Requests</h2>
          <button onClick={() => onTabChange?.("verifications")} className="text-xs font-medium transition-colors" style={{ color: colors.accent }}>View all →</button>
        </div>
        {pendingVerifications.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={cs}>
            <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: colors.accent }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>All caught up! No pending verifications.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingVerifications.map((vr, i) => {
              const tutorName = getUserName(vr.tutorId);
              const statusColor = vr.status === "pending" ? "var(--badge-pending-color)" : "var(--badge-info-color)";
              return (
                <div key={vr.id} className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`}
                  style={cs}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${statusColor}15` }}>
                      <ShieldCheck size={18} style={{ color: statusColor }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>{tutorName}</div>
                      <div className="text-xs" style={{ color: colors.textMuted }}>{vr.documents.length} documents · Requested {vr.requestedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize" style={{ background: `${statusColor}18`, color: statusColor }}>
                      {vr.status.replace("_", " ")}
                    </span>
                    <button onClick={() => onTabChange?.("verifications")} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.accentBorder}` }}>
                      Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}