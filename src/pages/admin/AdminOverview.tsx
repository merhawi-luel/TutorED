import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  Users,
  Building2,
  ShieldCheck,
  FileText,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import type { AdminTab } from "@/components/layout/AdminSidebar";

interface OverviewProps {
  onTabChange: (tab: AdminTab) => void;
}

export default function AdminOverview({ onTabChange }: OverviewProps) {
  const { allUsers, allTutorProfiles, allDocuments, allVerificationRequests, allOrganizations, getUserName } = useMockData();
  const { ref, inView } = useInView();

  const tutors = allUsers.filter((u) => u.role === "tutor");
  const pendingVerifications = allVerificationRequests.filter((vr) => vr.status === "pending" || vr.status === "under_review");
  const approvedVerifications = allVerificationRequests.filter((vr) => vr.status === "approved");
  const pendingDocs = allDocuments.filter((d) => d.status === "pending" || d.status === "under_review");
  const verifiedTutors = allTutorProfiles.filter((p) => p.verificationLevel === "verified");

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Platform overview and verification management.</p>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-2 lg:grid-cols-3 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { label: "Total Tutors", value: tutors.length, icon: Users, color: "#22C55E", tab: "tutors" as AdminTab },
          { label: "Verified Tutors", value: verifiedTutors.length, icon: CheckCircle2, color: "#4ADE80", tab: "tutors" as AdminTab },
          { label: "Pending Verifications", value: pendingVerifications.length, icon: Clock, color: "#F59E0B", tab: "verifications" as AdminTab },
          { label: "Agencies", value: allOrganizations.length, icon: Building2, color: "#3B82F6", tab: "agencies" as AdminTab },
          { label: "Pending Documents", value: pendingDocs.length, icon: FileText, color: "#F59E0B", tab: "documents" as AdminTab },
          { label: "Open Vacancies", value: 6, icon: Briefcase, color: "#A855F7", tab: "agencies" as AdminTab },
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

      {/* Pending Verification Requests */}
      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-400">Pending Verification Requests</h2>
          <button
            onClick={() => onTabChange("verifications")}
            className="text-xs font-medium transition-colors"
            style={{ color: "#22C55E" }}
          >
            View all →
          </button>
        </div>

        {pendingVerifications.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <CheckCircle2 size={28} className="mx-auto mb-2" style={{ color: "#22C55E" }} />
            <p className="text-sm text-gray-400">All caught up! No pending verifications.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingVerifications.map((vr, i) => {
              const tutorName = getUserName(vr.tutorId);
              const statusColor = vr.status === "pending" ? "#F59E0B" : "#3B82F6";
              return (
                <div
                  key={vr.id}
                  className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 300)} ${inView ? "in-view" : ""}`}
                  style={{ background: "#111111", border: "1px solid #1F1F1F" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${statusColor}15` }}
                    >
                      <ShieldCheck size={18} style={{ color: statusColor }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{tutorName}</div>
                      <div className="text-xs text-gray-500">
                        {vr.documents.length} documents · Requested {vr.requestedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${statusColor}18`, color: statusColor }}
                    >
                      {vr.status.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => onTabChange("verifications")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.25)" }}
                    >
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
