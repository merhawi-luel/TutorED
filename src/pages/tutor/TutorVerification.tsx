import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ArrowRight,
} from "lucide-react";

const LEVEL_CONFIG = {
  verified: { label: "Fully Verified", color: "#22C55E", icon: CheckCircle2 },
  partial: { label: "Partially Verified", color: "#F59E0B", icon: Clock },
  unverified: { label: "Unverified", color: "#6B7280", icon: AlertCircle },
  suspended: { label: "Suspended", color: "#EF4444", icon: AlertCircle },
};

const DOC_CHECKLIST = [
  { type: "government_id", label: "Government ID", required: true },
  { type: "degree_certificate", label: "Degree Certificate", required: true },
  { type: "transcript", label: "Academic Transcript", required: false },
  { type: "teaching_certificate", label: "Teaching Certificate", required: false },
] as const;

export default function TutorVerification() {
  const { tutorProfile, documents, verificationRequest, requestVerification } = useMockData();
  const { ref, inView } = useInView();

  const level = tutorProfile?.verificationLevel ?? "unverified";
  const cfg = LEVEL_CONFIG[level];
  const LevelIcon = cfg.icon;

  const getDocStatus = (type: string) => {
    return documents.find((d) => d.type === type)?.status ?? "none";
  };

  const requiredVerified = DOC_CHECKLIST.filter((d) => d.required).every(
    (d) => getDocStatus(d.type) === "verified"
  );

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Verification</h1>
        <p className="text-sm text-gray-400 mt-1">
          Get verified to build trust with agencies. Verify once, apply anywhere.
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`rounded-2xl p-6 md:p-8 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{
          background: level === "verified" ? "rgba(34,197,94,0.08)" : "#111111",
          border: `1px solid ${level === "verified" ? "rgba(34,197,94,0.25)" : "#1F1F1F"}`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${cfg.color}18` }}
          >
            <LevelIcon size={32} style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-white">{cfg.label}</h2>
              {level === "verified" && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: "#22C55E", color: "black" }}
                >
                  🟢 VERIFIED
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {level === "verified"
                ? `Verified on ${verificationRequest?.reviewedAt ?? "August 2026"}. Your badge is visible to agencies.`
                : level === "partial"
                ? "Some documents are still pending review. Complete all required documents to become fully verified."
                : level === "suspended"
                ? "Your verification has been suspended. Please contact support."
                : "Upload your documents and submit a verification request to get started."}
            </p>
          </div>
        </div>

        {/* Verification Details */}
        {level === "verified" && (
          <div
            className="mt-6 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ borderTop: "1px solid rgba(34,197,94,0.15)" }}
          >
            {[
              { label: "Identity", status: "verified" },
              { label: "Education", status: "verified" },
              { label: "Credentials", status: "verified" },
              { label: "Last Reviewed", status: "Aug 2026" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                <div className="text-sm font-medium" style={{ color: "#22C55E" }}>
                  {item.status === "verified" ? "✓ Verified" : item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Checklist */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Document Checklist</h2>
        <p className="text-xs text-gray-500">
          Required documents must be verified for full verification status.
        </p>

        <div className="space-y-2">
          {DOC_CHECKLIST.map((item) => {
            const status = getDocStatus(item.type);
            const isVerified = status === "verified";
            const isPending = status === "pending" || status === "under_review";
            const isRejected = status === "rejected";

            return (
              <div
                key={item.type}
                className="flex items-center justify-between rounded-xl px-4 py-3"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isVerified
                        ? "rgba(34,197,94,0.15)"
                        : isPending
                        ? "rgba(245,158,11,0.12)"
                        : isRejected
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(107,114,128,0.1)",
                    }}
                  >
                    {isVerified ? (
                      <CheckCircle2 size={16} style={{ color: "#22C55E" }} />
                    ) : isPending ? (
                      <Clock size={16} style={{ color: "#F59E0B" }} />
                    ) : isRejected ? (
                      <AlertCircle size={16} style={{ color: "#EF4444" }} />
                    ) : (
                      <FileText size={16} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-white">{item.label}</span>
                    {item.required && (
                      <span className="text-xs text-gray-600 ml-2">Required</span>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isVerified ? "#22C55E" : isPending ? "#F59E0B" : isRejected ? "#EF4444" : "#6B7280",
                  }}
                >
                  {isVerified ? "✓ Verified" : isPending ? "Pending" : isRejected ? "Rejected" : "Not uploaded"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Request Verification */}
      {level !== "verified" && level !== "suspended" && (
        <section
          className={`rounded-2xl p-6 fade-up delay-300 ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid #1F1F1F" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-medium text-white mb-1">Ready to get verified?</h2>
              <p className="text-xs text-gray-400">
                {verificationRequest
                  ? `Verification request ${verificationRequest.status}. You'll be notified once reviewed.`
                  : requiredVerified
                  ? "All required documents are uploaded. Submit your verification request."
                  : "Upload all required documents before requesting verification."}
              </p>
            </div>
            {!verificationRequest && (
              <button
                onClick={requestVerification}
                disabled={!requiredVerified}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 shrink-0"
                style={{ background: "#22C55E", color: "black" }}
              >
                Request Verification
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
