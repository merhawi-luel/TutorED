import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Eye,
  ExternalLink,
  MapPin,
  Mail,
  User,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

interface AgencyReceipt {
  orgId: string;
  orgName: string;
  orgDescription: string;
  orgLocation: string;
  ownerName: string;
  ownerEmail: string;
  receipt: {
    id: string;
    fileName: string;
    fileKey: string | null;
    status: string;
    submittedAt: string;
    reviewerNote: string | null;
  } | null;
  createdAt: string;
}

export default function AdminAgencyReceipts() {
  const { ref, inView } = useInView();
  const { colors } = useTheme();

  const [receipts, setReceipts] = useState<AgencyReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<AgencyReceipt | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<AgencyReceipt | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAgencyReceipts();
      setReceipts(data);
    } catch (err) {
      console.error("Failed to fetch agency receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = receipts.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.orgName.toLowerCase().includes(q) ||
      r.ownerName.toLowerCase().includes(q) ||
      r.ownerEmail.toLowerCase().includes(q) ||
      r.orgLocation.toLowerCase().includes(q)
    );
  });

  const handlePreview = async (receipt: AgencyReceipt) => {
    setSelectedReceipt(receipt);
    setPreviewLoading(true);
    try {
      const data = await adminApi.previewAgencyReceipt(receipt.orgId);
      setPreviewUrl(data.previewUrl);
    } catch (err) {
      console.error("Failed to load preview:", err);
      setPreviewUrl(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApprove = async (orgId: string) => {
    setActionLoading(orgId);
    try {
      await adminApi.verifyAgency(orgId);
      setToast({ type: "success", message: "Agency verified successfully!" });
      setReceipts((prev) => prev.filter((r) => r.orgId !== orgId));
      setSelectedReceipt(null);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: "error", message: "Failed to verify agency" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.orgId);
    try {
      await adminApi.rejectAgency(rejectModal.orgId, rejectReason);
      setToast({ type: "success", message: "Agency rejected. They can resubmit." });
      setReceipts((prev) => prev.filter((r) => r.orgId !== rejectModal.orgId));
      setRejectModal(null);
      setSelectedReceipt(null);
      setRejectReason("");
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: "error", message: "Failed to reject agency" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const cs: React.CSSProperties = {
    background: colors.bgCard,
    border: `1px solid ${colors.borderColor}`,
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "rgb(34,197,94)" : "rgb(239,68,68)",
          }}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
          Agency Receipts
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          Review and approve agency verification receipts
        </p>
      </div>

      {/* Search */}
      <div className={`rounded-2xl p-5 fade-up delay-100 ${inView ? "in-view" : ""}`} style={cs}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: colors.textMuted }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agency name, owner, email, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: colors.bgInput,
              border: `1px solid ${colors.borderColor}`,
              color: colors.textPrimary,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      {receipts.length > 0 && (
        <div className={`grid grid-cols-3 gap-4 fade-up delay-150 ${inView ? "in-view" : ""}`}>
          <div className="rounded-xl p-4" style={cs}>
            <div className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
              Pending Review
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.accent }}>
              {receipts.length}
            </div>
          </div>
          <div className="rounded-xl p-4" style={cs}>
            <div className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
              With Receipt
            </div>
            <div className="text-2xl font-bold" style={{ color: "rgb(34,197,94)" }}>
              {receipts.filter((r) => r.receipt).length}
            </div>
          </div>
          <div className="rounded-xl p-4" style={cs}>
            <div className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>
              Missing Receipt
            </div>
            <div className="text-2xl font-bold" style={{ color: "rgb(239,68,68)" }}>
              {receipts.filter((r) => !r.receipt).length}
            </div>
          </div>
        </div>
      )}

      {/* Receipt List */}
      <div className={`space-y-4 fade-up delay-200 ${inView ? "in-view" : ""}`}>
        {loading ? (
          <div className="rounded-2xl p-12 text-center" style={cs}>
            <Loader2
              size={32}
              className="mx-auto mb-3 animate-spin"
              style={{ color: colors.accent }}
            />
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Loading receipts...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={cs}>
            <Building2
              size={32}
              className="mx-auto mb-3"
              style={{ color: colors.textMuted }}
            />
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {search ? "No agencies match this search." : "No pending receipts to review."}
            </p>
          </div>
        ) : (
          filtered.map((receipt, i) => (
            <div
              key={receipt.orgId}
              className={`rounded-2xl p-6 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
              style={cs}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Org Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: colors.accent, color: "#fff" }}
                    >
                      {receipt.orgName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: colors.textPrimary }}
                        >
                          {receipt.orgName}
                        </span>
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            color: "rgb(245,158,11)",
                          }}
                        >
                          <Clock size={10} /> Pending
                        </span>
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: colors.textMuted }}
                      >
                        {receipt.orgDescription || "No description"}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div
                    className="flex flex-wrap gap-4 text-xs mb-3"
                    style={{ color: colors.textMuted }}
                  >
                    <span className="flex items-center gap-1">
                      <User size={12} /> {receipt.ownerName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {receipt.ownerEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {receipt.orgLocation || "No location"}
                    </span>
                  </div>

                  {/* Receipt Status */}
                  {receipt.receipt ? (
                    <div
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.2)",
                      }}
                    >
                      <FileText size={14} style={{ color: "rgb(34,197,94)" }} />
                      <span style={{ color: colors.textSecondary }}>
                        {receipt.receipt.fileName}
                      </span>
                      <span style={{ color: colors.textMuted }}>
                        • Uploaded{" "}
                        {new Date(receipt.receipt.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                      }}
                    >
                      <AlertCircle size={14} style={{ color: "rgb(239,68,68)" }} />
                      <span style={{ color: "rgb(239,68,68)" }}>
                        No receipt uploaded yet
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  {receipt.receipt && (
                    <button
                      onClick={() => handlePreview(receipt)}
                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2"
                      style={{
                        background: colors.bgInput,
                        border: `1px solid ${colors.borderColor}`,
                        color: colors.textPrimary,
                      }}
                    >
                      <Eye size={14} /> View Receipt
                    </button>
                  )}
                  <button
                    onClick={() => handleApprove(receipt.orgId)}
                    disabled={actionLoading === receipt.orgId}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      border: "1px solid rgba(34,197,94,0.3)",
                      color: "rgb(34,197,94)",
                    }}
                  >
                    {actionLoading === receipt.orgId ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setRejectModal(receipt);
                      setRejectReason("");
                    }}
                    disabled={actionLoading === receipt.orgId}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                    style={{
                      background: "rgba(239,68,68,0.15)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "rgb(239,68,68)",
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setSelectedReceipt(null);
            setPreviewUrl(null);
          }}
        >
          <div
            className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: `1px solid ${colors.borderColor}` }}
            >
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  {selectedReceipt.orgName} — Receipt
                </h2>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                  {selectedReceipt.ownerName} • {selectedReceipt.ownerEmail}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  setPreviewUrl(null);
                }}
                className="p-2 rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {previewLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: colors.accent }}
                  />
                </div>
              ) : previewUrl ? (
                <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.borderColor}` }}>
                  {selectedReceipt.receipt?.fileName?.endsWith(".pdf") ? (
                    <iframe
                      src={previewUrl}
                      className="w-full"
                      style={{ height: "60vh" }}
                      title="Receipt Preview"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Receipt"
                      className="w-full object-contain"
                      style={{ maxHeight: "60vh" }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText
                    size={48}
                    className="mx-auto mb-3"
                    style={{ color: colors.textMuted }}
                  />
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Could not load receipt preview
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="flex items-center justify-end gap-3 p-5"
              style={{ borderTop: `1px solid ${colors.borderColor}` }}
            >
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  setPreviewUrl(null);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: colors.bgInput,
                  border: `1px solid ${colors.borderColor}`,
                  color: colors.textPrimary,
                }}
              >
                Close
              </button>
              <button
                onClick={() => handleApprove(selectedReceipt.orgId)}
                disabled={actionLoading === selectedReceipt.orgId}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: "rgb(34,197,94)",
                  color: "#fff",
                }}
              >
                {actionLoading === selectedReceipt.orgId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                Approve Agency
              </button>
              <button
                onClick={() => {
                  setRejectModal(selectedReceipt);
                  setRejectReason("");
                }}
                disabled={actionLoading === selectedReceipt.orgId}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "rgb(239,68,68)",
                }}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setRejectModal(null);
            setRejectReason("");
          }}
        >
          <div
            className="rounded-2xl max-w-md w-full p-6"
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.borderColor}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: colors.textPrimary }}
            >
              Reject {rejectModal.orgName}
            </h2>
            <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
              Provide a reason for rejection. The agency will be notified and can
              resubmit.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none mb-4"
              style={{
                background: colors.bgInput,
                border: `1px solid ${colors.borderColor}`,
                color: colors.textPrimary,
              }}
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: colors.bgInput,
                  border: `1px solid ${colors.borderColor}`,
                  color: colors.textPrimary,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.orgId}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                style={{
                  background: "rgb(239,68,68)",
                  color: "#fff",
                }}
              >
                {actionLoading === rejectModal.orgId ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <XCircle size={14} />
                )}
                Reject Agency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
