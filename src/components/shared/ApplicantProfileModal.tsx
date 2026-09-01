import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Shield,
} from "lucide-react";
import { agencyApi } from "@/lib/api";
import type { TutorProfile, EducationEntry } from "@/types";

interface Document {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  reviewerNote: string | null;
}

interface Review {
  id: string;
  applicationId: string;
  parentId: string;
  tutorId: string;
  rating: number;
  description: string;
  createdAt: string;
  parentName?: string;
}

interface ApplicantProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorId: string;
  tutorName: string;
  tutorProfile: TutorProfile | null;
  educationEntries?: EducationEntry[];
}

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

const VERIFICATION_LEVEL_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  verified: { color: "#22C55E", label: "Fully Verified", icon: "✓" },
  partial: { color: "#F59E0B", label: "Partially Verified", icon: "◐" },
  unverified: { color: "#6B7280", label: "Unverified", icon: "○" },
  suspended: { color: "#F87171", label: "Suspended", icon: "✗" },
};

const EDU_STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  approved: { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
  pending: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  rejected: { color: "#F87171", bg: "rgba(239,68,68,0.12)" },
};

export default function ApplicantProfileModal({
  isOpen,
  onClose,
  tutorId,
  tutorName,
  tutorProfile,
  educationEntries: educationEntriesProp,
}: ApplicantProfileModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>(educationEntriesProp || []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (isOpen && tutorId) {
      fetchAll();
    }
  }, [isOpen, tutorId]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docs, edu, rev] = await Promise.allSettled([
        agencyApi.getTutorDocuments(tutorId),
        educationEntriesProp ? Promise.resolve(educationEntriesProp) : agencyApi.getTutorEducationEntries(tutorId),
        agencyApi.getTutorReviews(tutorId),
      ]);
      if (docs.status === "fulfilled") setDocuments(docs.value);
      if (edu.status === "fulfilled") setEducationEntries(edu.value);
      if (rev.status === "fulfilled") setReviews(rev.value);
    } catch (err) {
      setError("Failed to load profile data");
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const result = await agencyApi.previewTutorDocument(doc.id);
      setPreviewDoc({ ...doc, previewUrl: result.previewUrl } as any);
    } catch (err) {
      console.error("Error previewing document:", err);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const result = await agencyApi.downloadTutorDocument(doc.id);
      window.open(result.downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };

  if (!isOpen) return null;

  const verificationConfig = tutorProfile
    ? VERIFICATION_LEVEL_CONFIG[tutorProfile.verificationLevel] || VERIFICATION_LEVEL_CONFIG.unverified
    : VERIFICATION_LEVEL_CONFIG.unverified;

  const verifiedDocs = documents.filter((d) => d.status === "verified");
  const pendingDocs = documents.filter((d) => d.status === "pending" || d.status === "under_review");
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", border: "1px solid #1F1F1F" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1F1F1F" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
            >
              {tutorName.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{tutorName}</h2>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: `${verificationConfig.color}20`, color: verificationConfig.color }}
                >
                  <Shield size={12} />
                  {verificationConfig.label}
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
          {loading ? (
            <div className="rounded-xl p-6 flex items-center justify-center" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
              <Loader2 size={20} className="animate-spin text-gray-500" />
              <span className="ml-2 text-sm text-gray-500">Loading profile...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertCircle size={16} style={{ color: "#F87171" }} />
              <span className="text-sm text-gray-400">{error}</span>
            </div>
          ) : (
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
                      <div className="text-xs text-white">{avgRating} / 5 ({reviews.length})</div>
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
                    <span key={s} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>
                      {s}
                    </span>
                  ))}
                  {tutorProfile.grades.map((g) => (
                    <span key={g} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Education Entries */}
              {educationEntries.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Education & Credentials</h3>
                  <div className="space-y-2">
                    {educationEntries.map((entry) => {
                      const statusStyle = EDU_STATUS_CONFIG[entry.status] || EDU_STATUS_CONFIG.pending;
                      return (
                        <div
                          key={entry.id}
                          className="rounded-xl px-4 py-3"
                          style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-white font-medium">{entry.title}</div>
                              <div className="text-xs text-gray-500">{entry.name}</div>
                              {entry.description && (
                                <div className="text-xs text-gray-400 mt-1 leading-relaxed">{entry.description}</div>
                              )}
                            </div>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                              style={{ background: statusStyle.bg, color: statusStyle.color }}
                            >
                              {entry.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Documents</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs">
                    {verifiedDocs.length > 0 && (
                      <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}>
                        <CheckCircle2 size={12} /> {verifiedDocs.length} verified
                      </span>
                    )}
                    {pendingDocs.length > 0 && (
                      <span className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
                        <AlertCircle size={12} /> {pendingDocs.length} pending
                      </span>
                    )}
                  </div>
                  <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
                    {documents.map((doc) => {
                      const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pending;
                      return (
                        <div key={doc.id} className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #1F1F1F" }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                              <FileText size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <div className="text-sm text-white">{doc.title}</div>
                              <div className="text-xs text-gray-500">{DOC_TYPE_LABELS[doc.type] || doc.type}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                              {statusConfig.label}
                            </span>
                            {doc.status === "verified" && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => handlePreview(doc)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Preview">
                                  <Eye size={14} className="text-gray-500" />
                                </button>
                                <button onClick={() => handleDownload(doc)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Download">
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
              </div>

              {/* Teaching Mode & Availability */}
              {tutorProfile && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl p-3" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
                    <div className="text-[10px] text-gray-600 uppercase mb-1">Teaching Mode</div>
                    <div className="text-xs text-white capitalize">{tutorProfile.teachingMode}</div>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
                    <div className="text-[10px] text-gray-600 uppercase mb-1">Availability</div>
                    <div className="text-xs text-white">{tutorProfile.availability || "Not specified"}</div>
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Reviews from Parents</span>
                  </div>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(34,197,94,0.1)" }}>
                      <Star size={12} style={{ color: "#22C55E" }} fill="#22C55E" />
                      <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>{avgRating}</span>
                    </div>
                  )}
                </div>
                {reviews.length === 0 ? (
                  <div className="rounded-xl p-6 text-center" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
                    <Star size={24} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-500">No reviews yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-xl px-4 py-3" style={{ background: "var(--bg-input)", border: "1px solid #1F1F1F" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{review.parentName || "Parent"}</span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={12} style={{ color: i < review.rating ? "#22C55E" : "#4B5563" }} fill={i < review.rating ? "#22C55E" : "none"} />
                            ))}
                          </div>
                        </div>
                        {review.description && (
                          <p className="text-xs text-gray-400 leading-relaxed">{review.description}</p>
                        )}
                        <p className="text-[10px] text-gray-600 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end" style={{ borderTop: "1px solid #1F1F1F" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9CA3AF" }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (previewDoc as any).previewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setPreviewDoc(null)} />
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid #1F1F1F" }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid #1F1F1F" }}>
              <span className="text-sm text-white">{previewDoc.title}</span>
              <button onClick={() => setPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-white/5">
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <iframe src={(previewDoc as any).previewUrl} className="w-full" style={{ height: "calc(90vh - 60px)" }} title={previewDoc.title} />
          </div>
        </div>
      )}
    </div>
  );
}
