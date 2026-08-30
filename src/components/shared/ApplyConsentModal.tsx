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
  verified: { color: "#22C55E", label: "Verified" },
  pending: { color: "#F59E0B", label: "Pending" },
  under_review: { color: "#60A5FA", label: "Under Review" },
  rejected: { color: "#F87171", label: "Rejected" },
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
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #1F1F1F" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <Shield size={20} style={{ color: "#22C55E" }} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Share Profile</h2>
              <p className="text-xs text-gray-500">Review before applying</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Question */}
          <div
            className="rounded-xl p-4"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <p className="text-sm text-white font-medium">
              Are you willing to share your profile with{" "}
              <span style={{ color: "#22C55E" }}>{agencyName}</span>?
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Applying to: <span className="text-gray-300">{vacancyTitle}</span>
            </p>
          </div>

          {/* Documents Card */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-gray-500" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Your Documents
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
                <p className="text-sm text-gray-500">
                  No documents uploaded yet. Upload documents to get verified.
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              >
                {/* Summary */}
                <div className="px-4 py-3 flex items-center gap-4 text-xs" style={{ borderBottom: "1px solid #1F1F1F" }}>
                  {verifiedCount > 0 && (
                    <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}>
                      <CheckCircle2 size={12} />
                      {verifiedCount} verified
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5" style={{ color: "#F59E0B" }}>
                      <AlertCircle size={12} />
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                {/* Document List */}
                <div className="divide-y" style={{ borderColor: "#1F1F1F" }}>
                  {documents.map((doc) => {
                    const statusConfig = DOC_STATUS_CONFIG[doc.status] || DOC_STATUS_CONFIG.pending;
                    return (
                      <div key={doc.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                          >
                            <FileText size={14} className="text-gray-500" />
                          </div>
                          <div>
                            <div className="text-sm text-white">{doc.title}</div>
                            <div className="text-xs text-gray-500">
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
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p>
              The agency will see your profile information and document verification status.
              Your actual documents remain private and are only accessible by platform verification officers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid #1F1F1F" }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9CA3AF",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
            style={{ background: "#22C55E", color: "black" }}
          >
            Yes, Share & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
