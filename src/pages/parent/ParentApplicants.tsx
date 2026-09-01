import { useTheme } from "@/context/ThemeContext";
import { useData } from "@/context/DataContext";
import { useState, useEffect, useCallback } from "react";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Send,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  ChevronDown,
  Eye,
  FileText,
  X,
  Loader2,
  AlertCircle,
  Download,
  Shield,
  User,
} from "lucide-react";
import type { ApplicationStatus, TutorProfile, EducationEntry } from "@/types";

// ─── Types ──────────────────────────────────────────────────────

interface Applicant {
  id: string;
  tutorId: string;
  vacancyId: string;
  vacancyTitle: string;
  status: string;
  appliedAt: string;
  updatedAt: string;
  tutorName: string;
  tutorEmail: string;
  tutorProfile: TutorProfile | null;
  educationEntries: EducationEntry[];
}

interface TutorDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
}

// ─── Constants ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  applied: { color: "var(--text-secondary)", label: "Applied" },
  under_review: { color: "var(--badge-info-color)", label: "Under Review" },
  shortlisted: { color: "var(--accent)", label: "Shortlisted" },
  interview: { color: "var(--badge-purple-color)", label: "Interview" },
  accepted: { color: "var(--accent)", label: "Accepted" },
  completed: { color: "var(--accent)", label: "Completed" },
  rejected: { color: "var(--danger-color)", label: "Rejected" },
  withdrawn: { color: "var(--text-muted)", label: "Withdrawn" },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  government_id: "Government ID",
  degree_certificate: "Degree Certificate",
  diploma: "Diploma",
  transcript: "Transcript",
  teaching_certificate: "Teaching Certificate",
  professional_certification: "Professional Certification",
  experience_letter: "Experience Letter",
};

const DOC_STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  verified: { color: "var(--accent)", label: "Verified", bg: "var(--accent-bg)" },
  pending: { color: "var(--badge-pending-color)", label: "Pending", bg: "var(--badge-pending-bg)" },
  under_review: { color: "var(--badge-info-color)", label: "Under Review", bg: "rgba(59,130,246,0.12)" },
  rejected: { color: "var(--danger-color)", label: "Rejected", bg: "var(--danger-bg)" },
};

const VERIFICATION_CONFIG: Record<string, { color: string; label: string }> = {
  verified: { color: "var(--accent)", label: "Fully Verified" },
  partial: { color: "var(--badge-pending-color)", label: "Partially Verified" },
  unverified: { color: "var(--text-muted)", label: "Unverified" },
  suspended: { color: "var(--danger-color)", label: "Suspended" },
};

const ACTIONS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "under_review", label: "Review", color: "var(--badge-info-color)" },
  { status: "shortlisted", label: "Shortlist", color: "var(--accent)" },
  { status: "interview", label: "Interview", color: "var(--badge-purple-color)" },
  { status: "accepted", label: "Accept", color: "var(--accent)" },
  { status: "completed", label: "Complete", color: "var(--accent)" },
  { status: "rejected", label: "Reject", color: "var(--danger-color)" },
];

// ─── Main Component ─────────────────────────────────────────────

export default function ParentApplicants() {
  const { ref, inView } = useInView();
  const { submitReview, reviews } = useData();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    tutorId: string;
    tutorName: string;
    tutorProfile: TutorProfile | null;
    educationEntries: EducationEntry[];
  }>({ isOpen: false, tutorId: "", tutorName: "", tutorProfile: null, educationEntries: [] });
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    tutorName: string;
  }>({ isOpen: false, applicationId: "", tutorName: "" });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    try {
      await parentApi.updateApplicationStatus(appId, status);
      const label = STATUS_CONFIG[status]?.label ?? status;
      setSuccessMsg(`Application updated to "${label}".`);
      setTimeout(() => setSuccessMsg(null), 2500);
      fetchApplicants();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await parentApi.getApplicants();
      const mapped = data.map((a: any) => ({
        id: a.id,
        tutorId: a.tutorId || a.tutor_id,
        vacancyId: a.vacancyId || a.vacancy_id,
        vacancyTitle: a.vacancyTitle || a.vacancy_title || "Unknown",
        status: a.status,
        appliedAt: a.appliedAt || a.applied_at || "",
        updatedAt: a.updatedAt || a.updated_at || "",
        tutorName: a.tutorName || a.tutor_name || "Unknown",
        tutorEmail: a.tutorEmail || a.tutor_email || "",
        tutorProfile: a.tutorProfile
          ? {
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
            }
          : null,
        educationEntries: (a.educationEntries || []).map((e: any) => ({
          id: e.id,
          tutorId: e.tutorId || e.tutor_id,
          name: e.name,
          title: e.title,
          description: e.description || "",
          status: e.status,
          submittedAt: e.submittedAt || e.submitted_at,
          reviewedAt: e.reviewedAt || e.reviewed_at || undefined,
          reviewerNote: e.reviewerNote || e.reviewer_note || undefined,
        })),
      }));
      setApplicants(mapped);
    } catch (err) {
      console.error("Failed to fetch applicants:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await submitReview({
        applicationId: reviewModal.applicationId,
        rating: reviewRating,
        description: reviewDescription,
      });
      setReviewModal({ isOpen: false, applicationId: "", tutorName: "" });
      setReviewRating(0);
      setReviewDescription("");
      fetchApplicants();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const hasReviewed = (applicationId: string) => {
    return reviews.some(r => r.applicationId === applicationId);
  };

  // Sort: applied first, then by date
  const sorted = [...applicants].sort((a, b) => {
    const order: Record<string, number> = { applied: 0, under_review: 1, shortlisted: 2, interview: 3, accepted: 4, rejected: 5, withdrawn: 6 };
    const diff = (order[a.status] ?? 5) - (order[b.status] ?? 5);
    return diff !== 0 ? diff : b.appliedAt.localeCompare(a.appliedAt);
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Applicants</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review tutors who applied to your vacancies. When a tutor applies, they share their profile and verified documents with you.
        </p>
      </div>

      {/* Consent Notice */}
      <div
        className={`rounded-xl px-5 py-4 flex items-start gap-3 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
      >
        <Shield size={18} className="mt-0.5 shrink-0" style={{ color: "var(--badge-info-color)" }} />
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-medium text-gray-300">Privacy Notice:</span> When a tutor applies to your vacancy, they consent to sharing their full profile and verified documents with you. You can view their education, experience, subjects, and uploaded documents (ID, degrees, certificates). This information is confidential and should only be used for recruitment purposes.
        </div>
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
          <span className="ml-3 text-sm text-[var(--text-muted)]">Loading applicants...</span>
        </div>
      )}

      {/* Applicant List */}
      {!loading && (
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
              <Send size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
              <p className="text-sm text-[var(--text-secondary)]">No applicants yet. Tutors will appear here once they apply to your vacancies.</p>
            </div>
          ) : (
            sorted.map((applicant, i) => {
              const cfg = STATUS_CONFIG[applicant.status] ?? STATUS_CONFIG.applied;
              const isExpanded = expandedId === applicant.id;
              const verification = VERIFICATION_CONFIG[applicant.tutorProfile?.verificationLevel || "unverified"];

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
                        {applicant.tutorName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{applicant.tutorName}</span>
                          {applicant.tutorProfile?.verificationLevel === "verified" && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                            >
                              ✓ Verified
                            </span>
                          )}
                          {applicant.tutorProfile?.verificationLevel === "partial" && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "var(--badge-pending-bg)", color: "var(--badge-pending-color)" }}
                            >
                              Partial
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">Applied to: {applicant.vacancyTitle}</div>
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
                              <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.education || "Not specified"}</div>
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
                              <div className="text-xs text-[var(--text-primary)]">{applicant.tutorProfile.location || "Not specified"}</div>
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

                      {/* Bio */}
                      {applicant.tutorProfile?.bio && (
                        <div>
                          <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">About</div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{applicant.tutorProfile.bio}</p>
                        </div>
                      )}

                      {/* Subjects & Grades */}
                      {applicant.tutorProfile && (
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.tutorProfile.subjects.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                            >
                              {s}
                            </span>
                          ))}
                          {applicant.tutorProfile.grades.map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ background: "var(--accent-bg)", color: "var(--text-secondary)" }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Verification & Contact */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5" style={{ color: verification.color }}>
                          <Shield size={12} />
                          {verification.label}
                        </div>
                        {applicant.tutorEmail && (
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <User size={12} />
                            {applicant.tutorEmail}
                          </div>
                        )}
                      </div>

                      {/* Education Entries */}
                      {applicant.educationEntries.length > 0 && (
                        <div>
                          <div className="text-[10px] text-[var(--text-faint)] uppercase mb-2">Verified Education</div>
                          <div className="space-y-2">
                            {applicant.educationEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex items-center justify-between rounded-lg px-3 py-2"
                                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                              >
                                <div>
                                  <div className="text-xs font-medium text-[var(--text-primary)]">{entry.title}</div>
                                  <div className="text-[10px] text-[var(--text-muted)]">{entry.name}</div>
                                  {entry.description && (
                                    <div className="text-[10px] text-[var(--text-faint)] mt-0.5 max-w-sm truncate">{entry.description}</div>
                                  )}
                                </div>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                                  style={{
                                    background: entry.status === "approved" ? "var(--accent-bg)" : entry.status === "pending" ? "var(--badge-pending-bg)" : "var(--danger-bg)",
                                    color: entry.status === "approved" ? "var(--accent)" : entry.status === "pending" ? "var(--badge-pending-color)" : "var(--danger-color)",
                                  }}
                                >
                                  {entry.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* View Profile Button */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() =>
                            setProfileModal({
                              isOpen: true,
                              tutorId: applicant.tutorId,
                              tutorName: applicant.tutorName,
                              tutorProfile: applicant.tutorProfile,
                              educationEntries: applicant.educationEntries,
                            })
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "var(--accent-bg)",
                            color: "var(--accent)",
                            border: "1px solid var(--accent-border)",
                          }}
                        >
                          <Eye size={13} /> View Full Profile & Documents
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
                        {applicant.status === "completed" && !hasReviewed(applicant.id) && (
                          <button
                            onClick={() => setReviewModal({ isOpen: true, applicationId: applicant.id, tutorName: applicant.tutorName })}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: "var(--accent)",
                              color: "#FFFFFF",
                              border: "none",
                            }}
                          >
                            <Star size={13} /> Leave Review
                          </button>
                        )}
                        {applicant.status === "completed" && hasReviewed(applicant.id) && (
                          <span
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
                            style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                          >
                            <CheckCircle2 size={13} /> Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Profile Modal */}
      <ParentApplicantProfileModal
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ ...profileModal, isOpen: false })}
        tutorId={profileModal.tutorId}
        tutorName={profileModal.tutorName}
        tutorProfile={profileModal.tutorProfile}
        educationEntries={profileModal.educationEntries}
      />
    </div>
  );
}

// ─── Profile Modal ──────────────────────────────────────────────

function ParentApplicantProfileModal({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  tutorProfile,
  educationEntries,
}: {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  tutorProfile: TutorProfile | null;
  educationEntries: EducationEntry[];
}) {
  const [documents, setDocuments] = useState<TutorDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<TutorDocument | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    if (isOpen && tutorId) {
      setConsentAccepted(false);
      fetchDocuments();
    }
  }, [isOpen, tutorId]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await parentApi.getTutorDocuments(tutorId);
      setDocuments(docs);
    } catch (err) {
      setError("Failed to load documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (doc: TutorDocument) => {
    try {
      const result = await parentApi.previewTutorDocument(doc.id);
      setPreviewDoc({ ...doc, previewUrl: result.previewUrl } as any);
    } catch (err) {
      console.error("Error previewing document:", err);
    }
  };

  const handleDownload = async (doc: TutorDocument) => {
    try {
      const result = await parentApi.downloadTutorDocument(doc.id);
      window.open(result.downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };

  if (!isOpen) return null;

  const verification = VERIFICATION_CONFIG[tutorProfile?.verificationLevel || "unverified"];
  const verifiedDocs = documents.filter((d) => d.status === "verified");
  const pendingDocs = documents.filter((d) => d.status === "pending" || d.status === "under_review");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
              style={{ background: "var(--accent)" }}
            >
              {tutorName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{tutorName}</h2>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: `${verification.color}20`, color: verification.color }}
                >
                  <Shield size={12} />
                  {verification.label}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{tutorProfile?.headline || "Tutor"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/5">
            <X size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Consent Banner */}
          {!consentAccepted && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} style={{ color: "var(--badge-pending-color)" }} />
                <span className="text-sm font-medium text-[var(--text-primary)]">Shared Profile Consent</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                This tutor has shared their full profile and verified documents with you as part of their application.
                By viewing, you acknowledge that this information is confidential and will only be used for recruitment purposes.
              </p>
              <button
                onClick={() => setConsentAccepted(true)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: "var(--badge-pending-color)", color: "black" }}
              >
                I Acknowledge & View Profile
              </button>
            </div>
          )}

          {consentAccepted && (
            <>
              {/* Profile Info */}
              {tutorProfile && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={14} className="text-[var(--text-muted)]" />
                    <div>
                      <div className="text-[10px] text-[var(--text-faint)] uppercase">Education</div>
                      <div className="text-xs text-[var(--text-primary)]">{tutorProfile.education || "Not specified"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-[var(--text-muted)]" />
                    <div>
                      <div className="text-[10px] text-[var(--text-faint)] uppercase">Experience</div>
                      <div className="text-xs text-[var(--text-primary)]">{tutorProfile.experience} years</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--text-muted)]" />
                    <div>
                      <div className="text-[10px] text-[var(--text-faint)] uppercase">Location</div>
                      <div className="text-xs text-[var(--text-primary)]">{tutorProfile.location || "Not specified"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[var(--text-muted)]" />
                    <div>
                      <div className="text-[10px] text-[var(--text-faint)] uppercase">Rating</div>
                      <div className="text-xs text-[var(--text-primary)]">{tutorProfile.rating} / 5</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              {tutorProfile?.bio && (
                <div>
                  <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">About</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{tutorProfile.bio}</p>
                </div>
              )}

              {/* Subjects & Grades */}
              {tutorProfile && (
                <div className="flex flex-wrap gap-2">
                  {tutorProfile.subjects.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                    >
                      {s}
                    </span>
                  ))}
                  {tutorProfile.grades.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: "var(--accent-bg)", color: "var(--text-secondary)" }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Education Entries */}
              {educationEntries.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">Education & Credentials</h3>
                  <div className="space-y-2">
                    {educationEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-xl px-4 py-3"
                        style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-[var(--text-primary)] font-medium">{entry.title}</div>
                            <div className="text-xs text-[var(--text-muted)]">{entry.name}</div>
                            {entry.description && (
                              <div className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{entry.description}</div>
                            )}
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                            style={{
                              background: entry.status === "approved" ? "var(--accent-bg)" : entry.status === "pending" ? "var(--badge-pending-bg)" : "var(--danger-bg)",
                              color: entry.status === "approved" ? "var(--accent)" : entry.status === "pending" ? "var(--badge-pending-color)" : "var(--danger-color)",
                            }}
                          >
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Shared Documents
                  </span>
                </div>

                {loading ? (
                  <div
                    className="rounded-xl p-6 flex items-center justify-center"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                  >
                    <Loader2 size={20} className="animate-spin text-[var(--text-muted)]" />
                    <span className="ml-2 text-sm text-[var(--text-muted)]">Loading documents...</span>
                  </div>
                ) : error ? (
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--danger-bg)" }}
                  >
                    <AlertCircle size={16} style={{ color: "var(--danger-color)" }} />
                    <span className="text-sm text-[var(--text-secondary)]">{error}</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div
                    className="rounded-xl p-6 text-center"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                  >
                    <FileText size={24} className="mx-auto mb-2 text-[var(--text-faint)]" />
                    <p className="text-sm text-[var(--text-muted)]">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="flex items-center gap-4 text-xs">
                      {verifiedDocs.length > 0 && (
                        <span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                          <CheckCircle2 size={12} />
                          {verifiedDocs.length} verified
                        </span>
                      )}
                      {pendingDocs.length > 0 && (
                        <span className="flex items-center gap-1.5" style={{ color: "var(--badge-pending-color)" }}>
                          <AlertCircle size={12} />
                          {pendingDocs.length} pending
                        </span>
                      )}
                    </div>

                    {/* Document List */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                    >
                      {documents.map((doc) => {
                        const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pending;
                        return (
                          <div
                            key={doc.id}
                            className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: "1px solid var(--border-color)" }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: "var(--accent-bg)" }}
                              >
                                <FileText size={16} className="text-[var(--text-muted)]" />
                              </div>
                              <div>
                                <div className="text-sm text-[var(--text-primary)]">{doc.title}</div>
                                <div className="text-xs text-[var(--text-muted)]">
                                  {DOC_TYPE_LABELS[doc.type] || doc.type}
                                </div>
                                {doc.reviewerNote && (
                                  <div className="text-xs text-[var(--text-faint)] mt-0.5">
                                    Note: {doc.reviewerNote}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ background: statusConfig.bg, color: statusConfig.color }}
                              >
                                {statusConfig.label}
                              </span>
                              {doc.status === "verified" && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handlePreview(doc)}
                                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                                    title="Preview"
                                  >
                                    <Eye size={14} className="text-[var(--text-muted)]" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                                    title="Download"
                                  >
                                    <Download size={14} className="text-[var(--text-muted)]" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Teaching Mode & Availability */}
              {tutorProfile && (
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                  >
                    <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">Teaching Mode</div>
                    <div className="text-xs text-[var(--text-primary)] capitalize">{tutorProfile.teachingMode}</div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                  >
                    <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">Availability</div>
                    <div className="text-xs text-[var(--text-primary)]">{tutorProfile.availability || "Not specified"}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (previewDoc as any).previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPreviewDoc(null)} />
          <div
            className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border-color)" }}>
              <span className="text-sm text-[var(--text-primary)]">{previewDoc.title}</span>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X size={16} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <iframe
              src={(previewDoc as any).previewUrl}
              className="w-full"
              style={{ height: "calc(90vh - 60px)" }}
              title={previewDoc.title}
            />
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Review {reviewModal.tutorName}
              </h3>
              <button
                onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })}
                className="p-1.5 rounded-lg hover:bg-black/5"
              >
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-all hover:scale-110"
                  >
                    <Star
                      size={28}
                      style={{ color: star <= reviewRating ? "var(--accent)" : "var(--text-faint)" }}
                      fill={star <= reviewRating ? "var(--accent)" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Your Review
              </label>
              <textarea
                value={reviewDescription}
                onChange={(e) => setReviewDescription(e.target.value)}
                placeholder="Share your experience with this tutor..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || reviewSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: reviewRating === 0 ? "var(--text-faint)" : "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  opacity: reviewSubmitting ? 0.7 : 1,
                  cursor: reviewRating === 0 ? "not-allowed" : "pointer",
                }}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
