import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { useData } from "@/context/DataContext";
import { agencyApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import ApplicantProfileModal from "@/components/shared/ApplicantProfileModal";
import {
  Send,
  CheckCircle2,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  ChevronDown,
  Eye,
} from "lucide-react";
import type { ApplicationStatus, TutorProfile } from "@/types";

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  applied: { color: "var(--text-secondary)", label: "Applied" },
  under_review: { color: "var(--badge-info-color)", label: "Under Review" },
  shortlisted: { color: "var(--accent)", label: "Shortlisted" },
  interview: { color: "var(--badge-purple-color)", label: "Interview" },
  accepted: { color: "var(--accent)", label: "Accepted" },
  rejected: { color: "var(--danger-color)", label: "Rejected" },
  withdrawn: { color: "var(--text-muted)", label: "Withdrawn" },
};

const ACTIONS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "under_review", label: "Review", color: "var(--badge-info-color)" },
  { status: "shortlisted", label: "Shortlist", color: "var(--accent)" },
  { status: "interview", label: "Interview", color: "var(--badge-purple-color)" },
  { status: "accepted", label: "Accept", color: "var(--accent)" },
  { status: "completed", label: "Complete", color: "var(--accent)" },
  { status: "rejected", label: "Reject", color: "var(--danger-color)" },
];

interface Applicant {
  id: string;
  tutorId: string;
  vacancyId: string;
  vacancyTitle: string;
  organizationName: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  tutorName: string;
  tutorProfile: TutorProfile | null;
}

export default function AgencyApplicants() {
  const { getAgencyVacancies, updateApplicationStatus } = useData();
  const { ref, inView } = useInView();

  const [selectedVacancy, setSelectedVacancy] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    tutorId: string;
    tutorName: string;
    tutorProfile: TutorProfile | null;
  }>({ isOpen: false, tutorId: "", tutorName: "", tutorProfile: null });

  const myVacancies = getAgencyVacancies();
  const vacancyMap = new Map(myVacancies.map((v) => [v.id, v]));

  const fetchApplicants = useCallback(async () => {
    try {
      const data = await agencyApi.getApplicants();
      const mapped = data.map((a: any) => ({
        id: a.id,
        tutorId: a.tutorId || a.tutor_id,
        vacancyId: a.vacancyId || a.vacancy_id,
        vacancyTitle: a.vacancyTitle || a.vacancy_title || "Unknown",
        organizationName: a.organizationName || a.organization_name || "Unknown",
        status: a.status,
        appliedAt: a.appliedAt || a.applied_at || "",
        updatedAt: a.updatedAt || a.updated_at || "",
        tutorName: a.tutorName || a.tutor_name || "Unknown",
        tutorProfile: a.tutorProfile ? {
          userId: a.tutorProfile.userId || a.tutorProfile.user_id,
          headline: a.tutorProfile.headline || "",
          bio: a.tutorProfile.bio || "",
          subjects: a.tutorProfile.subjects || [],
          grades: a.tutorProfile.grades || [],
          experience: a.tutorProfile.experience || 0,
          education: a.tutorProfile.education || "",
          location: a.tutorProfile.location || "",
          teachingMode: a.tutorProfile.teachingMode || a.tutorProfile.teaching_mode || "in-person",
          availability: a.tutorProfile.availability || "",
          rating: parseFloat(a.tutorProfile.rating) || 0,
          applicationCount: a.tutorProfile.applicationCount || a.tutorProfile.application_count || 0,
          verificationLevel: a.tutorProfile.verificationLevel || a.tutorProfile.verification_level || "unverified",
        } : null,
      }));
      setAllApplicants(mapped);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // Check for vacancy filter from sessionStorage (when clicking View Applicants from vacancies page)
  useEffect(() => {
    const filterId = sessionStorage.getItem("filterVacancyId");
    if (filterId) {
      setSelectedVacancy(filterId);
      sessionStorage.removeItem("filterVacancyId");
    }
  }, []);

  let displayApplicants = allApplicants;
  if (selectedVacancy !== "all") {
    displayApplicants = displayApplicants.filter((a) => a.vacancyId === selectedVacancy);
  }
  if (statusFilter !== "all") {
    displayApplicants = displayApplicants.filter((a) => a.status === statusFilter);
  }

  // Sort: applied/under_review first, then by date
  displayApplicants.sort((a, b) => {
    const order: Record<string, number> = { applied: 0, under_review: 1, shortlisted: 2, interview: 3, accepted: 4, rejected: 5, withdrawn: 6 };
    const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
    return diff !== 0 ? diff : b.appliedAt.localeCompare(a.appliedAt);
  });

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    updateApplicationStatus(appId, status);
    const label = STATUS_CONFIG[status]?.label ?? status;
    setSuccessMsg(`Application updated to "${label}".`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Applicants</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Review and manage applicants across all your vacancies.</p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Vacancy Selector */}
          <div className="relative flex-1">
            <select
              value={selectedVacancy}
              onChange={(e) => setSelectedVacancy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none appearance-none"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
            >
              <option value="all">All Vacancies</option>
              {myVacancies.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 flex-wrap">
          {[{ value: "all", label: "All" }, ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: statusFilter === f.value ? "var(--accent-bg)" : "var(--accent-bg)",
                border: `1px solid ${statusFilter === f.value ? "rgba(34,197,94,0.3)" : "var(--border-color)"}`,
                color: statusFilter === f.value ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applicant List */}
      <div className="space-y-3">
        {displayApplicants.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <Send size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No applicants match this filter.</p>
          </div>
        ) : (
          displayApplicants.map((applicant, i) => {
            const cfg = STATUS_CONFIG[applicant.status] ?? STATUS_CONFIG.applied;
            const isExpanded = expandedId === applicant.id;
            const vacancy = vacancyMap.get(applicant.vacancyId);

            return (
              <div
                key={applicant.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {(applicant.tutorName || "U").split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">{applicant.tutorName}</span>
                        {applicant.tutorProfile?.verificationLevel === "verified" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>
                            ✓ Verified
                          </span>
                        )}
                        {applicant.tutorProfile?.verificationLevel === "partial" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "var(--badge-pending-bg)", color: "var(--badge-pending-color)" }}>
                            Partial
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{applicant.vacancyTitle}</div>
                      <div className="text-xs text-[var(--text-faint)] mt-0.5">Applied {applicant.appliedAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-[var(--text-muted)] transition-transform"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border-color)" }} className="px-5 py-5 space-y-4">
                    {/* Profile Info */}
                    {applicant.tutorProfile && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-[var(--text-muted)]" />
                          <div>
                            <div className="text-[10px] text-[var(--text-faint)] uppercase">Education</div>
                            <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.education}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-[var(--text-muted)]" />
                          <div>
                            <div className="text-[10px] text-[var(--text-faint)] uppercase">Experience</div>
                            <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.experience} years</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-[var(--text-muted)]" />
                          <div>
                            <div className="text-[10px] text-[var(--text-faint)] uppercase">Location</div>
                            <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-[var(--text-muted)]" />
                          <div>
                            <div className="text-[10px] text-[var(--text-faint)] uppercase">Rating</div>
                            <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.rating} / 5</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subjects */}
                    {applicant.tutorProfile && (
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.tutorProfile.subjects.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: "var(--accent-bg)", color: "var(--text-secondary)" }}>
                            {s}
                          </span>
                        ))}
                        {applicant.tutorProfile.grades.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded text-xs" style={{ background: "var(--accent-bg)", color: "var(--text-muted)" }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Requirements Match */}
                    {vacancy && (
                      <div
                        className="rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs"
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                      >
                        <span className="text-[var(--text-muted)]">Requirements:</span>
                        <span className="text-[var(--text-secondary)]">Education: {vacancy.requiredEducation}</span>
                        <span className="text-[var(--text-secondary)]">Experience: {vacancy.requiredExperience}+ years</span>
                        <span className="text-[var(--text-secondary)]">Mode: {vacancy.teachingMode}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setProfileModal({
                          isOpen: true,
                          tutorId: applicant.tutorId,
                          tutorName: applicant.tutorName,
                          tutorProfile: applicant.tutorProfile,
                        })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                      >
                        <Eye size={13} /> View Full Profile
                      </button>
                      {ACTIONS.map((action) => {
                        const isActive = applicant.status === action.status;
                        return (
                          <button
                            key={action.status}
                            onClick={() => handleStatusChange(applicant.id, action.status)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: isActive ? `${action.color}25` : `${action.color}10`,
                              color: action.color,
                              border: `1.5px solid ${isActive ? action.color : `${action.color}40`}`,
                              opacity: isActive ? 1 : 0.8,
                            }}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* Profile Modal */}
      <ApplicantProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        tutorId={profileModal.tutorId}
        tutorName={profileModal.tutorName}
        tutorProfile={profileModal.tutorProfile}
      />
    </div>
  );
}
