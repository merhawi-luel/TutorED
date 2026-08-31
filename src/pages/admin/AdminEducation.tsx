import { useTheme } from "@/context/ThemeContext";
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
  approved: { color: "var(--accent)", label: "Approved", icon: CheckCircle2 },
  pending: { color: "var(--badge-pending-color)", label: "Pending", icon: Clock },
  rejected: { color: "var(--danger-color)", label: "Rejected", icon: XCircle },
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
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Education Review</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Review tutor education entries. A tutor is verified only when ALL entries are approved.
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

      {/* Entries List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <GraduationCap size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No education entries match this filter.</p>
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
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
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
                      <div className="text-sm font-medium text-[var(--text-primary)]">{entry.title}</div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                        <User size={11} className="text-[var(--text-faint)]" />
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
                    {isExpanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border-color)" }} className="px-5 py-5 space-y-4">
                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">Name</div>
                        <div className="text-sm text-[var(--text-primary)]">{entry.name}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">Title</div>
                        <div className="text-sm text-[var(--text-primary)]">{entry.title}</div>
                      </div>
                    </div>

                    {entry.description && (
                      <div>
                        <div className="text-[10px] text-[var(--text-faint)] uppercase mb-1">Description</div>
                        <p className="text-sm text-gray-300 leading-relaxed">{entry.description}</p>
                      </div>
                    )}

                    {entry.reviewerNote && (
                      <div
                        className="rounded-xl px-4 py-3"
                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                      >
                        <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1">Rejection Note</div>
                        <div className="text-sm" style={{ color: "var(--danger-color)" }}>{entry.reviewerNote}</div>
                      </div>
                    )}

                    {/* Actions */}
                    {canAct && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{ background: "var(--accent)", color: "#fff" }}
                        >
                          <CheckCircle2 size={15} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ id: entry.id, name: `${entry.name} — ${entry.title}` })}
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
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Reject Education Entry</h2>
                <p className="text-xs text-[var(--text-muted)]">{rejectModal.name}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Reason for rejection</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Explain why this entry is being rejected..."
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
