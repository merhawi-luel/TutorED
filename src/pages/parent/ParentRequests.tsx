import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { FileText, Clock, CheckCircle, XCircle, MapPin, Phone, Mail } from "lucide-react";

const STATUS_MAP: Record<string, { bg: string; color: string; label: string; icon: typeof Clock }> = {
  pending: { bg: "var(--badge-pending-bg)", color: "var(--badge-pending-color)", label: "Pending", icon: Clock },
  contacted: { bg: "rgba(59,130,246,0.15)", color: "var(--badge-info-color)", label: "Contacted", icon: Clock },
  accepted: { bg: "var(--accent-bg)", color: "var(--accent)", label: "Accepted", icon: CheckCircle },
  completed: { bg: "rgba(34,197,94,0.2)", color: "var(--accent)", label: "Completed", icon: CheckCircle },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "var(--danger-color)", label: "Rejected", icon: XCircle },
};

export default function ParentRequests() {
  const { ref, inView } = useInView();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    parentApi.getRequests().then(setRequests).catch(() => {});
  }, []);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">My Requests</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Track your recruitment requests and their status.
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          className={`rounded-xl p-12 text-center fade-up delay-100 ${inView ? "in-view" : ""}`}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          <FileText size={40} className="mx-auto mb-4" style={{ color: "var(--border-color)" }} />
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">No requests yet</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            When you contact an agency or post a recruitment request, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => {
            const status = STATUS_MAP[req.status] ?? STATUS_MAP.pending;
            const Icon = status.icon;
            return (
              <div
                key={req.id}
                className="rounded-xl p-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{req.subject} — {req.grade}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {req.organizationName || "General request"} · {req.createdAt?.split("T")[0] || req.createdAt}
                    </div>
                  </div>
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: status.bg, color: status.color }}
                  >
                    <Icon size={12} />
                    {status.label}
                  </span>
                </div>

                {/* Contact info sent */}
                {(req.parentName || req.parentEmail || req.parentPhone || req.location) && (
                  <div
                    className="mt-2 rounded-lg px-3 py-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]"
                    style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
                  >
                    {req.parentName && (
                      <span className="text-[var(--text-secondary)]">Contact: <span className="text-[var(--text-primary)]">{req.parentName}</span></span>
                    )}
                    {req.parentEmail && (
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]"><Mail size={10} /> {req.parentEmail}</span>
                    )}
                    {req.parentPhone && (
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]"><Phone size={10} /> {req.parentPhone}</span>
                    )}
                    {req.location && (
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]"><MapPin size={10} /> {req.location}</span>
                    )}
                  </div>
                )}

                {req.notes && (
                  <div className="mt-2 text-xs text-[var(--text-muted)] italic">"{req.notes}"</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
