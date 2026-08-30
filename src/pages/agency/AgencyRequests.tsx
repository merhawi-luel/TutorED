import { useState, useEffect, useCallback } from "react";
import { agencyApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Inbox,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  User,
  BookOpen,
  Loader2,
  ChevronDown,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Pending" },
  contacted: { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", label: "Contacted" },
  accepted: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80", label: "Accepted" },
  completed: { bg: "rgba(34,197,94,0.2)", color: "#22C55E", label: "Completed" },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#F87171", label: "Rejected" },
};

const ACTIONS: { status: string; label: string; color: string }[] = [
  { status: "contacted", label: "Mark Contacted", color: "#60A5FA" },
  { status: "accepted", label: "Accept", color: "#4ADE80" },
  { status: "completed", label: "Complete", color: "#22C55E" },
  { status: "rejected", label: "Reject", color: "#F87171" },
];

interface Request {
  id: string;
  subject: string;
  grade: string;
  location: string;
  notes: string;
  status: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  createdAt: string;
}

export default function AgencyRequests() {
  const { ref, inView } = useInView();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await agencyApi.getRequests();
      setRequests(
        data.map((r: any) => ({
          id: r.id,
          subject: r.subject,
          grade: r.grade,
          location: r.location || "",
          notes: r.notes || "",
          status: r.status,
          parentName: r.parentName || r.parent_name || "",
          parentEmail: r.parentEmail || r.parent_email || "",
          parentPhone: r.parentPhone || r.parent_phone || "",
          createdAt: r.createdAt || r.created_at || "",
        }))
      );
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filtered =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const handleStatusChange = async (requestId: string, status: string) => {
    try {
      await agencyApi.updateRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );
      const label = STATUS_CONFIG[status]?.label ?? status;
      setSuccessMsg(`Request updated to "${label}".`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">Recruitment Requests</h1>
          {pendingCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
            >
              {pendingCount} pending
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Parents looking for tutors have sent requests to your organization.
        </p>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Status Filter */}
      <div className={`flex gap-1.5 flex-wrap fade-up delay-100 ${inView ? "in-view" : ""}`}>
        {[
          { value: "all", label: "All" },
          ...Object.entries(STATUS_CONFIG).map(([v, c]) => ({ value: v, label: c.label })),
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: statusFilter === f.value ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${statusFilter === f.value ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: statusFilter === f.value ? "#22C55E" : "#9CA3AF",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Loading requests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <Inbox size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">
              {requests.length === 0
                ? "No recruitment requests yet."
                : "No requests match this filter."}
            </p>
          </div>
        ) : (
          filtered.map((req, i) => {
            const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pending;
            const isExpanded = expandedId === req.id;

            return (
              <div
                key={req.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(59,130,246,0.12)" }}
                    >
                      <User size={18} style={{ color: "#60A5FA" }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {req.parentName || "Parent"}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-medium"
                          style={{ background: `${cfg.color}18`, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        <BookOpen size={11} className="inline mr-1" />
                        {req.subject} — {req.grade}
                        {req.location && (
                          <>
                            <span className="mx-1.5">·</span>
                            <MapPin size={11} className="inline mr-0.5" />
                            {req.location}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-500 transition-transform shrink-0"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                  />
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1F1F1F" }} className="px-5 py-5 space-y-4">
                    {/* Contact Info */}
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
                    >
                      <div className="text-[10px] text-gray-500 uppercase mb-2">Parent Contact Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-gray-500" />
                          <div>
                            <div className="text-gray-500">Name</div>
                            <div className="text-white">{req.parentName || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-gray-500" />
                          <div>
                            <div className="text-gray-500">Email</div>
                            <div className="text-white">{req.parentEmail || "—"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-500" />
                          <div>
                            <div className="text-gray-500">Phone</div>
                            <div className="text-white">{req.parentPhone || "—"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-lg px-3 py-2" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                        <div className="text-[10px] text-gray-600 uppercase">Subject</div>
                        <div className="text-white">{req.subject}</div>
                      </div>
                      <div className="rounded-lg px-3 py-2" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                        <div className="text-[10px] text-gray-600 uppercase">Grade</div>
                        <div className="text-white">{req.grade}</div>
                      </div>
                      <div className="rounded-lg px-3 py-2" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                        <div className="text-[10px] text-gray-600 uppercase">Location</div>
                        <div className="text-white">{req.location || "—"}</div>
                      </div>
                      <div className="rounded-lg px-3 py-2" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                        <div className="text-[10px] text-gray-600 uppercase">Received</div>
                        <div className="text-white">{req.createdAt.split("T")[0] || "—"}</div>
                      </div>
                    </div>

                    {/* Notes */}
                    {req.notes && (
                      <div className="rounded-xl px-4 py-3" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                        <div className="text-[10px] text-gray-600 uppercase mb-1">Notes</div>
                        <p className="text-xs text-gray-400 italic">"{req.notes}"</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ACTIONS.map((action) => {
                        const isActive = req.status === action.status;
                        return (
                          <button
                            key={action.status}
                            onClick={() => handleStatusChange(req.id, action.status)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: isActive ? `${action.color}25` : `${action.color}10`,
                              color: action.color,
                              border: `1px solid ${isActive ? action.color : `${action.color}30`}`,
                              opacity: isActive ? 1 : 0.7,
                            }}
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
