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
import type { TutorProfile } from "@/types";

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
  applied: { color: "#9CA3AF", label: "Applied" },
  under_review: { color: "#60A5FA", label: "Under Review" },
  shortlisted: { color: "#4ADE80", label: "Shortlisted" },
  interview: { color: "#C084FC", label: "Interview" },
  accepted: { color: "#22C55E", label: "Accepted" },
  rejected: { color: "#F87171", label: "Rejected" },
  withdrawn: { color: "#6B7280", label: "Withdrawn" },
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
  verified: { color: "#22C55E", label: "Verified", bg: "rgba(34,197,94,0.12)" },
  pending: { color: "#F59E0B", label: "Pending", bg: "rgba(245,158,11,0.12)" },
  under_review: { color: "#60A5FA", label: "Under Review", bg: "rgba(59,130,246,0.12)" },
  rejected: { color: "#F87171", label: "Rejected", bg: "rgba(239,68,68,0.12)" },
};

const VERIFICATION_CONFIG: Record<string, { color: string; label: string }> = {
  verified: { color: "#22C55E", label: "Fully Verified" },
  partial: { color: "#F59E0B", label: "Partially Verified" },
  unverified: { color: "#6B7280", label: "Unverified" },
  suspended: { color: "#F87171", label: "Suspended" },
};

// ─── Main Component ─────────────────────────────────────────────

export default function ParentApplicants() {
  const { ref, inView } = useInView();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean;
    tutorId: string;
    tutorName: string;
    tutorProfile: TutorProfile | null;
  }>({ isOpen: false, tutorId: "", tutorName: "", tutorProfile: null });

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
        <h1 className="text-2xl font-semibold text-white">Applicants</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review tutors who applied to your vacancies. When a tutor applies, they share their profile and verified documents with you.
        </p>
      </div>

      {/* Consent Notice */}
      <div
        className={`rounded-xl px-5 py-4 flex items-start gap-3 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}
      >
        <Shield size={18} className="mt-0.5 shrink-0" style={{ color: "#60A5FA" }} />
        <div className="text-xs text-gray-400 leading-relaxed">
          <span className="font-medium text-gray-300">Privacy Notice:</span> When a tutor applies to your vacancy, they consent to sharing their full profile and verified documents with you. You can view their education, experience, subjects, and uploaded documents (ID, degrees, certificates). This information is confidential and should only be used for recruitment purposes.
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-gray-500" />
          <span className="ml-3 text-sm text-gray-500">Loading applicants...</span>
        </div>
      )}

      {/* Applicant List */}
      {!loading && (
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
              <Send size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-sm text-gray-400">No applicants yet. Tutors will appear here once they apply to your vacancies.</p>
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
                        {applicant.tutorName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{applicant.tutorName}</span>
                          {applicant.tutorProfile?.verificationLevel === "verified" && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
                            >
                              ✓ Verified
                            </span>
                          )}
                          {applicant.tutorProfile?.verificationLevel === "partial" && (
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                            >
                              Partial
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Applied to: {applicant.vacancyTitle}</div>
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
                              <div className="text-xs text-white">{applicant.tutorProfile.education || "Not specified"}</div>
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
                              <div className="text-xs text-white">{applicant.tutorProfile.location || "Not specified"}</div>
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

                      {/* Bio */}
                      {applicant.tutorProfile?.bio && (
                        <div>
                          <div className="text-[10px] text-gray-600 uppercase mb-1">About</div>
                          <p className="text-xs text-gray-400 leading-relaxed">{applicant.tutorProfile.bio}</p>
                        </div>
                      )}

                      {/* Subjects & Grades */}
                      {applicant.tutorProfile && (
                        <div className="flex flex-wrap gap-1.5">
                          {applicant.tutorProfile.subjects.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                            >
                              {s}
                            </span>
                          ))}
                          {applicant.tutorProfile.grades.map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded text-xs"
                              style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
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
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <User size={12} />
                            {applicant.tutorEmail}
                          </div>
                        )}
                      </div>

                      {/* View Profile Button */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() =>
                            setProfileModal({
                              isOpen: true,
                              tutorId: applicant.tutorId,
                              tutorName: applicant.tutorName,
                              tutorProfile: applicant.tutorProfile,
                            })
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            color: "#22C55E",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          <Eye size={13} /> View Full Profile & Documents
                        </button>
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
}: {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  tutorProfile: TutorProfile | null;
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
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1F1F1F" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
            >
              {tutorName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{tutorName}</h2>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: `${verification.color}20`, color: verification.color }}
                >
                  <Shield size={12} />
                  {verification.label}
                </span>
              </div>
              <p className="text-xs text-gray-500">{tutorProfile?.headline || "Tutor"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/5">
            <X size={18} className="text-gray-500" />
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
                <Shield size={16} style={{ color: "#F59E0B" }} />
                <span className="text-sm font-medium text-white">Shared Profile Consent</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                This tutor has shared their full profile and verified documents with you as part of their application.
                By viewing, you acknowledge that this information is confidential and will only be used for recruitment purposes.
              </p>
              <button
                onClick={() => setConsentAccepted(true)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: "#F59E0B", color: "black" }}
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
                    <GraduationCap size={14} className="text-gray-500" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase">Education</div>
                      <div className="text-xs text-white">{tutorProfile.education || "Not specified"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-gray-500" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase">Experience</div>
                      <div className="text-xs text-white">{tutorProfile.experience} years</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase">Location</div>
                      <div className="text-xs text-white">{tutorProfile.location || "Not specified"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-gray-500" />
                    <div>
                      <div className="text-[10px] text-gray-600 uppercase">Rating</div>
                      <div className="text-xs text-white">{tutorProfile.rating} / 5</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              {tutorProfile?.bio && (
                <div>
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">About</h3>
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
                      style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
                    >
                      {s}
                    </span>
                  ))}
                  {tutorProfile.grades.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Documents Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Shared Documents
                  </span>
                </div>

                {loading ? (
                  <div
                    className="rounded-xl p-6 flex items-center justify-center"
                    style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                  >
                    <Loader2 size={20} className="animate-spin text-gray-500" />
                    <span className="ml-2 text-sm text-gray-500">Loading documents...</span>
                  </div>
                ) : error ? (
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    <AlertCircle size={16} style={{ color: "#F87171" }} />
                    <span className="text-sm text-gray-400">{error}</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div
                    className="rounded-xl p-6 text-center"
                    style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                  >
                    <FileText size={24} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="flex items-center gap-4 text-xs">
                      {verifiedDocs.length > 0 && (
                        <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}>
                          <CheckCircle2 size={12} />
                          {verifiedDocs.length} verified
                        </span>
                      )}
                      {pendingDocs.length > 0 && (
                        <span className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
                          <AlertCircle size={12} />
                          {pendingDocs.length} pending
                        </span>
                      )}
                    </div>

                    {/* Document List */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                    >
                      {documents.map((doc) => {
                        const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pending;
                        return (
                          <div
                            key={doc.id}
                            className="px-4 py-3 flex items-center justify-between"
                            style={{ borderBottom: "1px solid #1F1F1F" }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.04)" }}
                              >
                                <FileText size={16} className="text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm text-white">{doc.title}</div>
                                <div className="text-xs text-gray-500">
                                  {DOC_TYPE_LABELS[doc.type] || doc.type}
                                </div>
                                {doc.reviewerNote && (
                                  <div className="text-xs text-gray-600 mt-0.5">
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
                                    <Eye size={14} className="text-gray-500" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(doc)}
                                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                                    title="Download"
                                  >
                                    <Download size={14} className="text-gray-500" />
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
                    style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                  >
                    <div className="text-[10px] text-gray-600 uppercase mb-1">Teaching Mode</div>
                    <div className="text-xs text-white capitalize">{tutorProfile.teachingMode}</div>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                  >
                    <div className="text-[10px] text-gray-600 uppercase mb-1">Availability</div>
                    <div className="text-xs text-white">{tutorProfile.availability || "Not specified"}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid #1F1F1F" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9CA3AF",
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
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1F1F1F" }}>
              <span className="text-sm text-white">{previewDoc.title}</span>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X size={16} className="text-gray-500" />
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
    </div>
  );
}
