import { useState, useEffect } from "react";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { FileText, Clock, CheckCircle, XCircle, MapPin, Phone, Mail } from "lucide-react";

const STATUS_MAP: Record<string, { bg: string; color: string; label: string; icon: typeof Clock }> = {
  pending: { bg: "rgba(245,158,11,0.15)", color: "#F59E0B", label: "Pending", icon: Clock },
  contacted: { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", label: "Contacted", icon: Clock },
  accepted: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80", label: "Accepted", icon: CheckCircle },
  completed: { bg: "rgba(34,197,94,0.2)", color: "#22C55E", label: "Completed", icon: CheckCircle },
  rejected: { bg: "rgba(239,68,68,0.15)", color: "#F87171", label: "Rejected", icon: XCircle },
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
        <h1 className="text-2xl font-semibold text-white">My Requests</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your recruitment requests and their status.
        </p>
      </div>

      {requests.length === 0 ? (
        <div
          className={`rounded-xl p-12 text-center fade-up delay-100 ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid #1F1F1F" }}
        >
          <FileText size={40} className="mx-auto mb-4" style={{ color: "#2A2A2A" }} />
          <h3 className="text-sm font-medium text-white mb-1">No requests yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
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
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-white">{req.subject} — {req.grade}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
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
                      <span className="text-gray-400">Contact: <span className="text-white">{req.parentName}</span></span>
                    )}
                    {req.parentEmail && (
                      <span className="flex items-center gap-1 text-gray-400"><Mail size={10} /> {req.parentEmail}</span>
                    )}
                    {req.parentPhone && (
                      <span className="flex items-center gap-1 text-gray-400"><Phone size={10} /> {req.parentPhone}</span>
                    )}
                    {req.location && (
                      <span className="flex items-center gap-1 text-gray-400"><MapPin size={10} /> {req.location}</span>
                    )}
                  </div>
                )}

                {req.notes && (
                  <div className="mt-2 text-xs text-gray-500 italic">"{req.notes}"</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
