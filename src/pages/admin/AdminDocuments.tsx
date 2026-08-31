import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useData } from "@/context/DataContext";
import { adminApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import DocumentPreview from "@/components/shared/DocumentPreview";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Search,
  Download,
} from "lucide-react";
import type { DocumentStatus, DocumentType } from "@/types";

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  government_id: "Government ID",
  degree_certificate: "Degree Certificate",
  diploma: "Diploma",
  transcript: "Academic Transcript",
  teaching_certificate: "Teaching Certificate",
  professional_certification: "Professional Certification",
  experience_letter: "Experience Letter",
};

const STATUS_CONFIG: Record<DocumentStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  verified: { icon: CheckCircle2, color: "var(--accent)", label: "Verified" },
  pending: { icon: Clock, color: "var(--badge-pending-color)", label: "Pending" },
  under_review: { icon: Eye, color: "var(--badge-info-color)", label: "Under Review" },
  rejected: { icon: XCircle, color: "var(--danger-color)", label: "Rejected" },
  expired: { icon: AlertCircle, color: "var(--text-muted)", label: "Expired" },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminDocuments() {
  const { allDocuments, getUserName, approveDocument, rejectDocument } = useData();
  const { ref, inView } = useInView();
  const [docs, setDocs] = useState(allDocuments);

  useEffect(() => {
    // Fetch fresh documents from verification data
    adminApi.getVerifications().then((data) => {
      const allDocs = data.flatMap((vr: any) => (vr.documents || []).map((d: any) => ({
        ...d,
        tutorId: d.tutorId || d.tutor_id,
        fileName: d.fileName || d.file_name,
        submittedAt: d.submittedAt || d.submitted_at,
        reviewedAt: d.reviewedAt || d.reviewed_at,
        reviewerNote: d.reviewerNote || d.reviewer_note,
      })));
      setDocs(allDocs);
    }).catch(() => {});
  }, []);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ downloadUrl: string; fileName: string; title: string } | null>(null);

  const filtered = docs.filter((doc) => {
    if (filter !== "all" && doc.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const tutorName = getUserName(doc.tutorId).toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        tutorName.includes(q) ||
        DOC_TYPE_LABELS[doc.type].toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const { downloadUrl } = await adminApi.downloadDocument(docId);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handlePreview = async (docId: string, fileName: string, title: string) => {
    try {
      const { downloadUrl } = await adminApi.downloadDocument(docId);
      setPreviewDoc({ downloadUrl, fileName, title });
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  const handleApprove = (docId: string) => {
    approveDocument(docId);
    setSuccessMsg("Document approved.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleReject = () => {
    if (!rejectTarget || !rejectNote.trim()) return;
    rejectDocument(rejectTarget.id, rejectNote);
    setRejectTarget(null);
    setRejectNote("");
    setSuccessMsg("Document rejected.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Documents</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review and manage all submitted tutor documents.
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Search + Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tutor name, document title, or filename..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === f.value ? "var(--accent-bg)" : "var(--accent-bg)",
                border: `1px solid ${filter === f.value ? "rgba(34,197,94,0.3)" : "var(--border-color)"}`,
                color: filter === f.value ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Table */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <FileText size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No documents match this filter.</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const cfg = STATUS_CONFIG[doc.status];
            const StatusIcon = cfg.icon;
            const tutorName = getUserName(doc.tutorId);
            const canAct = doc.status === "pending" || doc.status === "under_review";

            return (
              <div
                key={doc.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl px-5 py-4 transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${cfg.color}15` }}
                  >
                    <FileText size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{doc.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {tutorName} · {DOC_TYPE_LABELS[doc.type]} · {doc.fileName}
                    </div>
                    <div className="text-xs text-[var(--text-faint)] mt-0.5">
                      Submitted {doc.submittedAt}
                      {doc.reviewedAt && ` · Reviewed ${doc.reviewedAt}`}
                      {doc.reviewerNote && (
                        <span style={{ color: "var(--danger-color)" }}> · "{doc.reviewerNote}"</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: `${cfg.color}18`, color: cfg.color }}
                  >
                    <StatusIcon size={13} />
                    {cfg.label}
                  </span>
                  <button
                    onClick={() => handlePreview(doc.id, doc.fileName, doc.title)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    title="Preview"
                  >
                    <Eye size={14} className="text-[var(--text-faint)] hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    title="Download"
                  >
                    <Download size={14} className="text-[var(--text-faint)] hover:text-emerald-400" />
                  </button>
                  {canAct && (
                    <>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget({ id: doc.id, name: doc.title })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "var(--danger-bg)", color: "var(--danger-color)" }}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreview
          downloadUrl={previewDoc.downloadUrl}
          fileName={previewDoc.fileName}
          title={previewDoc.title}
          onClose={() => setPreviewDoc(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--danger-bg)" }}>
                <AlertCircle size={18} style={{ color: "var(--danger-color)" }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Reject Document</h2>
                <p className="text-xs text-[var(--text-muted)]">{rejectTarget.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain why this document is being rejected..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectTarget(null); setRejectNote(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: "var(--danger-bg)", color: "var(--danger-color)", border: "1px solid var(--danger-border)" }}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
