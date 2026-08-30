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
  applied: { color: "#9CA3AF", label: "Applied" },
  under_review: { color: "#60A5FA", label: "Under Review" },
  shortlisted: { color: "#4ADE80", label: "Shortlisted" },
  interview: { color: "#C084FC", label: "Interview" },
  accepted: { color: "#22C55E", label: "Accepted" },
  rejected: { color: "#F87171", label: "Rejected" },
  withdrawn: { color: "#6B7280", label: "Withdrawn" },
};

const ACTIONS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "under_review", label: "Review", color: "#60A5FA" },
  { status: "shortlisted", label: "Shortlist", color: "#4ADE80" },
  { status: "interview", label: "Interview", color: "#C084FC" },
  { status: "accepted", label: "Accept", color: "#22C55E" },
  { status: "rejected", label: "Reject", color: "#F87171" },
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
        <h1 className="text-2xl font-semibold text-white">Applicants</h1>
        <p className="text-sm text-gray-400 mt-1">Review and manage applicants across all your vacancies.</p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Vacancy Selector */}
          <div className="relative flex-1">
            <select
              value={selectedVacancy}
              onChange={(e) => setSelectedVacancy(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none appearance-none"
              style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
            >
              <option value="all">All Vacancies</option>
              {myVacancies.map((v) => (
                <option key={v.id} value={v.id}>{v.title}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
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
                background: statusFilter === f.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${statusFilter === f.value ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: statusFilter === f.value ? "#22C55E" : "#9CA3AF",
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
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <Send size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No applicants match this filter.</p>
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
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : applicant.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                    >
                      {applicant.tutorName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{applicant.tutorName}</span>
                        {applicant.tutorProfile?.verificationLevel === "verified" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                            ✓ Verified
                          </span>
                        )}
                        {applicant.tutorProfile?.verificationLevel === "partial" && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}>
                            Partial
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{applicant.vacancyTitle}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Applied {applicant.appliedAt}</div>
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
                      className="text-gray-500 transition-transform"
                      style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1F1F1F" }} className="px-5 py-5 space-y-4">
                    {/* Profile Info */}
                    {applicant.tutorProfile && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-gray-500" />
                          <div>
                            <div className="text-[10px] text-gray-600 uppercase">Education</div>
                            <div className="text-xs text-white">{applicant.tutorProfile.education}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-gray-500" />
                          <div>
                            <div className="text-[10px] text-gray-600 uppercase">Experience</div>
                            <div className="text-xs text-white">{applicant.tutorProfile.experience} years</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-500" />
                          <div>
                            <div className="text-[10px] text-gray-600 uppercase">Location</div>
                            <div className="text-xs text-white">{applicant.tutorProfile.location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-gray-500" />
                          <div>
                            <div className="text-[10px] text-gray-600 uppercase">Rating</div>
                            <div className="text-xs text-white">{applicant.tutorProfile.rating} / 5</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subjects */}
                    {applicant.tutorProfile && (
                      <div className="flex flex-wrap gap-1.5">
                        {applicant.tutorProfile.subjects.map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                            {s}
                          </span>
                        ))}
                        {applicant.tutorProfile.grades.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "#6B7280" }}>
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Requirements Match */}
                    {vacancy && (
                      <div
                        className="rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-xs"
                        style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                      >
                        <span className="text-gray-500">Requirements:</span>
                        <span className="text-gray-400">Education: {vacancy.requiredEducation}</span>
                        <span className="text-gray-400">Experience: {vacancy.requiredExperience}+ years</span>
                        <span className="text-gray-400">Mode: {vacancy.teachingMode}</span>
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
                        style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }}
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
                              border: `1px solid ${isActive ? action.color : `${action.color}30`}`,
                              opacity: isActive ? 1 : 0.7,
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
