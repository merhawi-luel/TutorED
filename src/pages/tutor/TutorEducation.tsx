import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import {
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { EducationEntryStatus } from "@/types";

const STATUS_CONFIG: Record<EducationEntryStatus, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  approved: { color: "#22C55E", label: "Approved", icon: CheckCircle2 },
  pending: { color: "#F59E0B", label: "Pending", icon: Clock },
  rejected: { color: "#EF4444", label: "Rejected", icon: XCircle },
};

export default function TutorEducation() {
  const { educationEntries, addEducationEntry, removeEducationEntry } = useData();
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !title.trim()) {
      setError("Name and title are required");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addEducationEntry({ name: name.trim(), title: title.trim(), description: description.trim() });
      setName("");
      setTitle("");
      setDescription("");
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to add education entry");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    await removeEducationEntry(entryId);
    setDeleteConfirm(null);
  };

  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const cardBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const inputBg = isDark ? "#0D0D0D" : "#F1F5F9";
  const inputBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const textPrimary = isDark ? "#FFFFFF" : "#0F172A";
  const textSecondary = isDark ? "#9CA3AF" : "#475569";
  const textMuted = isDark ? "#6B7280" : "#94A3B8";
  const textFaint = isDark ? "#4B5563" : "#CBD5E1";

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>Education Verification</h1>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>
            Add your education credentials for admin verification. You must be approved to be verified.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Verification Rule */}
      <div
        className={`rounded-xl px-5 py-4 flex items-start gap-3 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: isDark ? "rgba(245,158,11,0.06)" : "rgba(234,179,8,0.06)", border: `1px solid ${isDark ? "rgba(245,158,11,0.15)" : "rgba(234,179,8,0.15)"}` }}
      >
        <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
        <div className="text-xs leading-relaxed" style={{ color: textSecondary }}>
          <span className="font-medium" style={{ color: textPrimary }}>Verification Rule:</span> You are only marked as verified when ALL of your submitted education entries are approved by an admin. If even one entry is pending or rejected, you remain unverified.
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <section
          className={`rounded-2xl p-6 space-y-4 fade-up delay-150 ${inView ? "in-view" : ""}`}
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>New Education Entry</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Merhawi Luel"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. BSc Computer Science"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your education or credential..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>

          {error && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || !name.trim() || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Submitting...</>
              ) : (
                <><Plus size={14} /> Add Entry</>
              )}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: inputBg, color: textSecondary, border: `1px solid ${inputBorder}` }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {educationEntries.length === 0 ? (
          <div
            className={`rounded-2xl p-12 text-center fade-up delay-200 ${inView ? "in-view" : ""}`}
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <GraduationCap size={32} className="mx-auto mb-3" style={{ color: textFaint }} />
            <p className="text-sm" style={{ color: textSecondary }}>No education entries yet.</p>
            <p className="text-xs mt-1" style={{ color: textFaint }}>Click "Add Entry" to submit your credentials for verification.</p>
          </div>
        ) : (
          educationEntries.map((entry, i) => {
            const cfg = STATUS_CONFIG[entry.status];
            const StatusIcon = cfg.icon;
            const isDeleteConfirming = deleteConfirm === entry.id;

            return (
              <div
                key={entry.id}
                className={`rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}15` }}
                    >
                      <StatusIcon size={18} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: textPrimary }}>{entry.title}</div>
                      <div className="text-xs" style={{ color: textMuted }}>
                        {entry.name} · Submitted {entry.submittedAt}
                      </div>
                      {entry.description && (
                        <div className="text-xs mt-0.5 max-w-md truncate" style={{ color: textFaint }}>{entry.description}</div>
                      )}
                      {entry.reviewerNote && (
                        <div className="text-xs mt-0.5" style={{ color: "#EF4444" }}>
                          Note: {entry.reviewerNote}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                    {entry.status === "pending" && !isDeleteConfirming && (
                      <button
                        onClick={() => setDeleteConfirm(entry.id)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                        title="Delete entry"
                      >
                        <Trash2 size={14} className="hover:text-red-400" style={{ color: textFaint }} />
                      </button>
                    )}
                    {isDeleteConfirming && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: "rgba(239,68,68,0.15)", color: "#F87171" }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: inputBg, color: textSecondary }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
