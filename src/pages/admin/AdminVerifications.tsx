import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { adminApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import DocumentPreview from "@/components/shared/DocumentPreview";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertCircle,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { VerificationRequestStatus, DocumentStatus } from "@/types";

const STATUS_CONFIG: Record<VerificationRequestStatus, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  pending: { color: "var(--badge-pending-color)", label: "Pending", icon: Clock },
  under_review: { color: "var(--badge-info-color)", label: "Under Review", icon: Eye },
  approved: { color: "var(--accent)", label: "Approved", icon: CheckCircle2 },
  rejected: { color: "var(--danger-color)", label: "Rejected", icon: XCircle },
};

const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  verified: "var(--accent)",
  pending: "var(--badge-pending-color)",
  under_review: "var(--badge-info-color)",
  rejected: "var(--danger-color)",
  expired: "var(--text-muted)",
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminVerifications() {
  const { allVerificationRequests, getUserName, approveDocument, rejectDocument, approveVerification, rejectVerification } = useData();
  const { colors } = useTheme();
  const { ref, inView } = useInView();

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ type: "document" | "verification"; id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ downloadUrl: string; fileName: string; title: string } | null>(null);

  const filtered = filter === "all"
    ? allVerificationRequests
    : allVerificationRequests.filter((vr) => vr.status === filter);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleApproveDocument = (docId: string) => {
    approveDocument(docId);
    setSuccessMsg("Document approved successfully.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleApproveVerification = (vrId: string) => {
    approveVerification(vrId);
    setSuccessMsg("Verification request approved. Tutor is now verified.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

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

  const handleReject = () => {
    if (!rejectModal || !rejectNote.trim()) return;
    if (rejectModal.type === "document") {
      rejectDocument(rejectModal.id, rejectNote);
      setSuccessMsg("Document rejected.");
    } else {
      rejectVerification(rejectModal.id, rejectNote);
      setSuccessMsg("Verification request rejected.");
    }
    setRejectModal(null);
    setRejectNote("");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Verification Queue</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review tutor verification requests and documents.
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className={`flex gap-1.5 flex-wrap fade-up delay-100 ${inView ? "in-view" : ""}`}>
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

      {/* Verification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <ShieldCheck size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No verification requests match this filter.</p>
          </div>
        ) : (
          filtered.map((vr, i) => {
            const tutorName = getUserName(vr.tutorId);
            const cfg = STATUS_CONFIG[vr.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === vr.id;
            const canAct = vr.status === "pending" || vr.status === "under_review";
            const verifiedCount = vr.documents.filter((d) => d.status === "verified").length;

            return (
              <div
                key={vr.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                {/* Request Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => toggleExpand(vr.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}15` }}
                    >
                      <StatusIcon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">{tutorName}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {vr.documents.length} documents · {verifiedCount} verified · Requested {vr.requestedAt}
                        {vr.reviewedAt && ` · Reviewed ${vr.reviewedAt}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                    >
                      {vr.status.replace("_", " ")}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border-color)" }} className="px-5 py-5 space-y-4">
                    {/* Documents */}
                    <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Submitted Documents</h3>
                    <div className="space-y-2">
                      {vr.documents.map((doc) => {
                        const docColor = DOC_STATUS_COLORS[doc.status];
                        return (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-xl px-4 py-3"
                            style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText size={16} style={{ color: docColor }} />
                              <div>
                                <span className="text-sm text-[var(--text-primary)]">{doc.title}</span>
                                <span className="text-xs text-[var(--text-faint)] ml-2">{doc.fileName}</span>
                                {doc.reviewerNote && (
                                  <div className="text-xs mt-0.5" style={{ color: "var(--danger-color)" }}>
                                    Note: {doc.reviewerNote}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                                style={{ background: `${docColor}18`, color: docColor }}
                              >
                                {doc.status.replace("_", " ")}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePreview(doc.id, doc.fileName, doc.title); }}
                                className="p-1 rounded-md transition-colors hover:bg-white/5"
                                title="Preview"
                              >
                                <Eye size={13} className="text-[var(--text-faint)] hover:text-blue-400" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownload(doc.id, doc.fileName); }}
                                className="p-1 rounded-md transition-colors hover:bg-white/5"
                                title="Download"
                              >
                                <Download size={13} className="text-[var(--text-faint)] hover:text-emerald-400" />
                              </button>
                              {canAct && (doc.status === "pending" || doc.status === "under_review") && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleApproveDocument(doc.id); }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                    style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRejectModal({ type: "document", id: doc.id, name: doc.title });
                                    }}
                                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                                    style={{ background: "var(--danger-bg)", color: "var(--danger-color)" }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    {canAct && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApproveVerification(vr.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "var(--accent)", color: "#fff" }}
                        >
                          <CheckCircle2 size={15} />
                          Approve Verification
                        </button>
                        <button
                          onClick={() => setRejectModal({ type: "verification", id: vr.id, name: tutorName })}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "var(--danger-bg)", color: "var(--danger-color)", border: "1px solid var(--danger-border)" }}
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
      {rejectModal && (
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
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Reject {rejectModal.type === "document" ? "Document" : "Verification"}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">{rejectModal.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain why this is being rejected..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(""); }}
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
