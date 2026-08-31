import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import type { EducationEntryStatus } from "@/types";

const STATUS_CONFIG: Record<EducationEntryStatus, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  approved: { color: "#22C55E", label: "Approved", icon: CheckCircle2 },
  pending: { color: "#F59E0B", label: "Pending", icon: Clock },
  rejected: { color: "#EF4444", label: "Rejected", icon: XCircle },
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminEducation() {
  const { allEducationEntries, approveEducationEntry, rejectEducationEntry } = useData();
  const { ref, inView } = useInView();

  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const filtered = filter === "all"
    ? allEducationEntries
    : allEducationEntries.filter((e) => e.status === filter);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleApprove = (entryId: string) => {
    approveEducationEntry(entryId);
    setSuccessMsg("Education entry approved successfully.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleReject = () => {
    if (!rejectModal || !rejectNote.trim()) return;
    rejectEducationEntry(rejectModal.id, rejectNote);
    setRejectModal(null);
    setRejectNote("");
    setSuccessMsg("Education entry rejected.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Education Review</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review tutor education entries. A tutor is verified only when ALL entries are approved.
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
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
              background: filter === f.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${filter === f.value ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f.value ? "#22C55E" : "#9CA3AF",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <GraduationCap size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No education entries match this filter.</p>
          </div>
        ) : (
          filtered.map((entry, i) => {
            const cfg = STATUS_CONFIG[entry.status];
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === entry.id;
            const canAct = entry.status === "pending";

            return (
              <div
                key={entry.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                {/* Entry Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => toggleExpand(entry.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}15` }}
                    >
                      <StatusIcon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{entry.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <User size={11} className="text-gray-600" />
                        {entry.name} · Submitted {entry.submittedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1F1F1F" }} className="px-5 py-5 space-y-4">
                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase mb-1">Name</div>
                        <div className="text-sm text-white">{entry.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase mb-1">Title</div>
                        <div className="text-sm text-white">{entry.title}</div>
                      </div>
                    </div>

                    {entry.description && (
                      <div>
                        <div className="text-[10px] text-gray-600 uppercase mb-1">Description</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{entry.description}</p>
                      </div>
                    )}

                    {entry.reviewerNote && (
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        <div className="text-[10px] text-gray-500 uppercase mb-1">Rejection Note</div>
                        <div className="text-sm" style={{ color: "#F87171" }}>{entry.reviewerNote}</div>
                      </div>
                    )}

                    {/* Actions */}
                    {canAct && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "#22C55E", color: "black" }}
                        >
                          <CheckCircle2 size={15} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: entry.id, name: `${entry.name} — ${entry.title}` })}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "rgba(239,68,68,0.12)", color: "#F87171", border: "1px solid rgba(239,68,68,0.25)" }}
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

      {/* Reject Modal */}
      {rejectModal && (
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
                <h2 className="text-sm font-semibold text-white">Reject Education Entry</h2>
                <p className="text-xs text-gray-500">{rejectModal.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain why this entry is being rejected..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none resize-none"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(""); }}
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
