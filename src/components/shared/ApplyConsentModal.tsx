import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import {
  X,
  Shield,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { tutorApi } from "@/lib/api";

interface Document {
  id: string;
  type: string;
  title: string;
  fileName: string;
  status: string;
}

interface ApplyConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agencyName: string;
  vacancyTitle: string;
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

const DOC_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  verified: { color: "var(--accent)", label: "Verified" },
  pending: { color: "var(--badge-pending-color)", label: "Pending" },
  under_review: { color: "var(--badge-info-color)", label: "Under Review" },
  rejected: { color: "var(--danger-color)", label: "Rejected" },
};

export default function ApplyConsentModal({
  isOpen,
  onClose,
  onConfirm,
  agencyName,
  vacancyTitle,
}: ApplyConsentModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await tutorApi.getDocuments();
      const filteredDocs = docs.filter((doc: Document) => doc.status !== "rejected");
      setDocuments(filteredDocs);
    } catch (err) {
      setError("Failed to load your documents");
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifiedCount = documents.filter((d) => d.status === "verified").length;
  const pendingCount = documents.filter((d) => d.status === "pending" || d.status === "under_review").length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-bg)" }}
            >
              <Shield size={20} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Share Profile</h2>
              <p className="text-xs text-[var(--text-muted)]">Review before applying</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
          >
            <X size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Question */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
          >
            <p className="text-sm text-[var(--text-primary)] font-medium">
              Are you willing to share your profile with{" "}
              <span style={{ color: "var(--accent)" }}>{agencyName}</span>?
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Applying to: <span className="text-gray-300">{vacancyTitle}</span>
            </p>
          </div>

          {/* Documents Card */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                Your Documents
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
                <p className="text-sm text-[var(--text-muted)]">
                  No documents uploaded yet. Upload documents to get verified.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
              >
                {/* Summary */}
                <div className="px-4 py-3 flex items-center gap-4 text-xs" style={{ borderBottom: "1px solid var(--border-color)" }}>
                  {verifiedCount > 0 && (
                    <span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                      <CheckCircle2 size={12} />
                      {verifiedCount} verified
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5" style={{ color: "var(--badge-pending-color)" }}>
                      <AlertCircle size={12} />
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                {/* Document List */}
                <div className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {documents.map((doc) => {
                    const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pending;
                    return (
                      <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "var(--accent-bg)" }}
                          >
                            <FileText size={14} className="text-[var(--text-muted)]" />
                          </div>
                          <div>
                            <div className="text-sm text-[var(--text-primary)]">{doc.title}</div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {DOC_TYPE_LABELS[doc.type] || doc.type}
                            </div>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            background: `${statusConfig.color}15`,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>
              The agency will see your profile information and document verification status.
              Your actual documents remain private and are only accessible by platform verification officers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid var(--border-color)" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Yes, Share & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
