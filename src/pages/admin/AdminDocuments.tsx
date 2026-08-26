import { useState } from "react";
import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Search,
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
  verified: { icon: CheckCircle2, color: "#22C55E", label: "Verified" },
  pending: { icon: Clock, color: "#F59E0B", label: "Pending" },
  under_review: { icon: Eye, color: "#3B82F6", label: "Under Review" },
  rejected: { icon: XCircle, color: "#EF4444", label: "Rejected" },
  expired: { icon: AlertCircle, color: "#6B7280", label: "Expired" },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminDocuments() {
  const { allDocuments, allUsers, getUserName, approveDocument, rejectDocument } = useMockData();
  const { ref, inView } = useInView();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = allDocuments.filter((doc) => {
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
        <h1 className="text-2xl font-semibold text-white">Documents</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review and manage all submitted tutor documents.
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Search + Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tutor name, document title, or filename..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === f.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${filter === f.value ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: filter === f.value ? "#22C55E" : "#9CA3AF",
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
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <FileText size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No documents match this filter.</p>
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
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${cfg.color}15` }}
                  >
                    <FileText size={18} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{doc.title}</div>
                    <div className="text-xs text-gray-500">
                      {tutorName} · {DOC_TYPE_LABELS[doc.type]} · {doc.fileName}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Submitted {doc.submittedAt}
                      {doc.reviewedAt && ` · Reviewed ${doc.reviewedAt}`}
                      {doc.reviewerNote && (
                        <span style={{ color: "#EF4444" }}> · "{doc.reviewerNote}"</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: `${cfg.color}18`, color: cfg.color }}
                  >
                    <StatusIcon size={13} />
                    {cfg.label}
                  </span>
                  {canAct && (
                    <>
                      <button
                        onClick={() => handleApprove(doc.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget({ id: doc.id, name: doc.title })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div
            className="w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)" }}>
                <AlertCircle size={18} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Reject Document</h2>
                <p className="text-xs text-gray-500">{rejectTarget.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain why this document is being rejected..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none resize-none"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectTarget(null); setRejectNote(""); }}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: "#161616", color: "#9CA3AF", border: "1px solid #1F1F1F" }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{ background: "rgba(239,68,68,0.2)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)" }}
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
