import { useState } from "react";
import { useData } from "@/context/DataContext";
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

  const inputStyle = {
    background: "#0D0D0D",
    border: "1px solid #1F1F1F",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Education Verification</h1>
          <p className="text-sm text-gray-400 mt-1">
            Add your education credentials for admin verification. You must be approved to be verified.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          <Plus size={16} />
          Add Entry
        </button>
      </div>

      {/* Verification Rule */}
      <div
        className={`rounded-xl px-5 py-4 flex items-start gap-3 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
      >
        <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: "#F59E0B" }} />
        <div className="text-xs text-gray-400 leading-relaxed">
          <span className="font-medium text-gray-300">Verification Rule:</span> You are only marked as verified when ALL of your submitted education entries are approved by an admin. If even one entry is pending or rejected, you remain unverified.
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <section
          className={`rounded-2xl p-6 space-y-4 fade-up delay-150 ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid #1F1F1F" }}
        >
          <h2 className="text-sm font-medium text-gray-300">New Education Entry</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Merhawi Luel"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. BSc Computer Science"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your education or credential..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              style={inputStyle}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "#22C55E", color: "black" }}
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Add Entry
                </>
              )}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "#161616", color: "#9CA3AF", border: "1px solid #1F1F1F" }}
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
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <GraduationCap size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No education entries yet.</p>
            <p className="text-xs text-gray-600 mt-1">Click "Add Entry" to submit your credentials for verification.</p>
          </div>
        ) : (
          educationEntries.map((entry, i) => {
            const cfg = STATUS_CONFIG[entry.status];
            const StatusIcon = cfg.icon;
            const isDeleteConfirming = deleteConfirm === entry.id;

            return (
              <div
                key={entry.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
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
                      <div className="text-sm font-medium text-white">{entry.title}</div>
                      <div className="text-xs text-gray-500">
                        {entry.name} · Submitted {entry.submittedAt}
                      </div>
                      {entry.description && (
                        <div className="text-xs text-gray-600 mt-0.5 max-w-md truncate">{entry.description}</div>
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
                        <Trash2 size={14} className="text-gray-600 hover:text-red-400" />
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
                          style={{ background: "#161616", color: "#9CA3AF" }}
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
