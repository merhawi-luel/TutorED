import { useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { tutorApi, uploadApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import DocumentPreview from "@/components/shared/DocumentPreview";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Trash2,
  Download,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DocumentType, DocumentStatus } from "@/types";

/* ─── Constants ──────────────────────────────────────── */

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

const DOC_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: "government_id", label: "Government ID" },
  { value: "degree_certificate", label: "Degree Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "transcript", label: "Academic Transcript" },
  { value: "teaching_certificate", label: "Teaching Certificate" },
  { value: "professional_certification", label: "Professional Certification" },
  { value: "experience_letter", label: "Experience Letter" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

/* ─── Component ──────────────────────────────────────── */

export default function TutorDocumentsAndVerification() {
  const { isDark } = useTheme();
  const { documents, addDocument, removeDocument, tutorProfile, verificationRequest, requestVerification } = useData();
  const { ref, inView } = useInView();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("government_id");
  const [docTitle, setDocTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Verification request state
  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<{ downloadUrl: string; fileName: string; title: string } | null>(null);

  // Collapse state for documents section
  const [docsExpanded, setDocsExpanded] = useState(true);

  /* ─── Derived ──────────────────────────────────────── */

  const level = tutorProfile?.verificationLevel ?? "unverified";
  const vCfg = LEVEL_CONFIG[level];
  const LevelIcon = vCfg.icon;

  const getDocStatus = (type: string) => documents.find((d) => d.type === type)?.status ?? "none";

  const requiredUploaded = DOC_CHECKLIST.filter((d) => d.required).every((d) =>
    documents.some((doc) => doc.type === d.type && doc.status !== "rejected")
  );

  const missingRequired = DOC_CHECKLIST.filter((d) => d.required).filter(
    (d) => !documents.some((doc) => doc.type === d.type && doc.status !== "rejected")
  );

  const verifiedDocs = documents.filter((d) => d.status === "verified").length;
  const totalRequired = DOC_CHECKLIST.filter((d) => d.required).length;
  const verifiedRequired = DOC_CHECKLIST.filter((d) => d.required).filter((d) =>
    documents.some((doc) => doc.type === d.type && doc.status === "verified")
  ).length;

  /* ─── Handlers ─────────────────────────────────────── */

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be under 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File must be under 10MB.");
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !docTitle) return;
    setUploading(true);
    setError(null);
    setUploadProgress("Generating upload URL...");
    try {
      const { signedUrl, fileKey } = await uploadApi.presign(selectedFile.name, selectedFile.type);
      setUploadProgress("Uploading file...");
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type },
      });
      if (!uploadRes.ok) throw new Error("Failed to upload file to storage");
      setUploadProgress("Saving document record...");
      await addDocument({
        tutorId: "",
        type: docType,
        title: docTitle,
        fileName: selectedFile.name,
        fileKey,
      });
      setSuccess("Document uploaded successfully!");
      setShowUpload(false);
      setDocTitle("");
      setSelectedFile(null);
      setDocType("government_id");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const { downloadUrl } = await tutorApi.downloadDocument(docId);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError("Failed to download document.");
      setTimeout(() => setError(null), 2500);
    }
  };

  const handlePreview = async (docId: string, fileName: string, title: string) => {
    try {
      const { downloadUrl } = await tutorApi.downloadDocument(docId);
      setPreviewDoc({ downloadUrl, fileName, title });
    } catch {
      setError("Failed to load preview.");
      setTimeout(() => setError(null), 2500);
    }
  };

  const handleDelete = async (docId: string) => {
    removeDocument(docId);
    setSuccess("Document removed.");
    setTimeout(() => setSuccess(null), 2500);
  };

  const resetForm = () => {
    setShowUpload(false);
    setDocTitle("");
    setSelectedFile(null);
    setDocType("government_id");
    setError(null);
    setUploadProgress("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRequestVerification = async () => {
    setRequestError(null);
    setRequesting(true);
    try {
      await requestVerification();
    } catch (err: any) {
      setRequestError(err.message || "Failed to submit verification request");
    } finally {
      setRequesting(false);
    }
  };

  /* ─── Styles ───────────────────────────────────────── */

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
      {/* ─── Header ────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>Documents & Verification</h1>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>
            Upload credentials and track your verification status.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* ─── Verification Status Banner ────────────────── */}
      <div
        className={`rounded-2xl p-6 md:p-8 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{
          background: level === "verified" ? "rgba(34,197,94,0.08)" : cardBg,
          border: `1px solid ${level === "verified" ? "rgba(34,197,94,0.25)" : cardBorder}`,
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${vCfg.color}18` }}
          >
            <LevelIcon size={32} style={{ color: vCfg.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>{vCfg.label}</h2>
              {level === "verified" && (
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold" style={{ background: "#22C55E", color: "black" }}>
                  VERIFIED
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: textSecondary }}>
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

        {/* Verified details */}
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
                <div className="text-xs mb-1" style={{ color: textMuted }}>{item.label}</div>
                <div className="text-sm font-medium" style={{ color: "#22C55E" }}>
                  {item.status === "verified" ? "✓ Verified" : item.status}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar for partial */}
        {level !== "verified" && level !== "suspended" && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: textMuted }}>
              <span>Required documents verified</span>
              <span className="font-medium" style={{ color: textSecondary }}>{verifiedRequired}/{totalRequired}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: isDark ? "#1F1F1F" : "#E2E8F0" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalRequired > 0 ? (verifiedRequired / totalRequired) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #22C55E, #4ADE80)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Document Checklist ────────────────────────── */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Document Checklist</h2>
        <p className="text-xs" style={{ color: textMuted }}>
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
                style={{ background: inputBg, border: `1px solid ${inputBorder}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: isVerified ? "rgba(34,197,94,0.15)" : isPending ? "rgba(245,158,11,0.12)" : isRejected ? "rgba(239,68,68,0.12)" : isDark ? "rgba(107,114,128,0.1)" : "rgba(107,114,128,0.08)",
                    }}
                  >
                    {isVerified ? <CheckCircle2 size={16} style={{ color: "#22C55E" }} /> : isPending ? <Clock size={16} style={{ color: "#F59E0B" }} /> : isRejected ? <AlertCircle size={16} style={{ color: "#EF4444" }} /> : <FileText size={16} style={{ color: textMuted }} />}
                  </div>
                  <div>
                    <span className="text-sm" style={{ color: textPrimary }}>{item.label}</span>
                    {item.required && (
                      <span className="text-xs ml-2" style={{ color: textFaint }}>Required</span>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isVerified ? "#22C55E" : isPending ? "#F59E0B" : isRejected ? "#EF4444" : textMuted,
                  }}
                >
                  {isVerified ? "✓ Verified" : isPending ? "Pending" : isRejected ? "Rejected" : "Not uploaded"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Request Verification ──────────────────────── */}
      {level !== "verified" && level !== "suspended" && (
        <section
          className={`rounded-2xl p-6 fade-up delay-300 ${inView ? "in-view" : ""}`}
          style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-sm font-medium mb-1" style={{ color: textPrimary }}>Ready to get verified?</h2>
              {verificationRequest ? (
                <p className="text-xs" style={{ color: textSecondary }}>
                  Verification request{" "}
                  <span
                    className="capitalize font-medium"
                    style={{
                      color: verificationRequest.status === "approved" ? "#22C55E" : verificationRequest.status === "rejected" ? "#EF4444" : verificationRequest.status === "under_review" ? "#3B82F6" : "#F59E0B",
                    }}
                  >
                    {verificationRequest.status.replace("_", " ")}
                  </span>
                  . You'll be notified once reviewed.
                </p>
              ) : !requiredUploaded ? (
                <div>
                  <p className="text-xs mb-2" style={{ color: textSecondary }}>
                    Upload all required documents before requesting verification.
                  </p>
                  <div className="space-y-1">
                    {missingRequired.map((item) => (
                      <div key={item.type} className="flex items-center gap-2 text-xs">
                        <XCircle size={12} style={{ color: "#EF4444" }} />
                        <span style={{ color: "#F87171" }}>{item.label} — not uploaded</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs" style={{ color: textSecondary }}>
                  All required documents are uploaded. Submit your verification request for review.
                </p>
              )}
            </div>
            {!verificationRequest && (
              <button
                onClick={handleRequestVerification}
                disabled={!requiredUploaded || requesting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 shrink-0"
                style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
              >
                {requesting ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  <><ShieldCheck size={14} /> Request Verification <ArrowRight size={14} /></>
                )}
              </button>
            )}
          </div>

          {requestError && (
            <div
              className="mt-4 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <AlertCircle size={15} />
              {requestError}
            </div>
          )}
        </section>
      )}

      {/* ─── Success / Error Messages ──────────────────── */}
      {success && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
      {error && !showUpload && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ─── Upload Form ───────────────────────────────── */}
      {showUpload && (
        <div
          className={`rounded-2xl p-6 space-y-4 fade-up ${inView ? "in-view" : ""}`}
          style={{ background: cardBg, border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Upload New Document</h2>

          {error && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              >
                {DOC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Title</label>
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. My Degree Certificate"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
              />
            </div>
          </div>

          {/* Drop zone */}
          <div
            className="rounded-xl p-8 text-center transition-colors"
            style={{
              background: inputBg,
              border: `2px dashed ${selectedFile ? "rgba(34,197,94,0.5)" : inputBorder}`,
              cursor: uploading ? "default" : "pointer",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <><Loader2 size={24} className="mx-auto mb-3 animate-spin" style={{ color: "#22C55E" }} /><p className="text-sm" style={{ color: "#22C55E" }}>{uploadProgress}</p></>
            ) : selectedFile ? (
              <>
                <FileText size={24} className="mx-auto mb-3" style={{ color: "#22C55E" }} />
                <p className="text-sm font-medium" style={{ color: "#22C55E" }}>{selectedFile.name}</p>
                <p className="text-xs mt-1" style={{ color: textMuted }}>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="mt-2 text-xs hover:underline transition-colors"
                  style={{ color: textMuted }}
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <Upload size={24} className="mx-auto mb-3" style={{ color: textMuted }} />
                <p className="text-sm" style={{ color: textSecondary }}>Click to select or drag & drop a file</p>
                <p className="text-xs mt-1" style={{ color: textFaint }}>PDF, JPG, or PNG — Max 10MB</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!docTitle || !selectedFile || uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
            >
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Submit Document</>}
            </button>
            <button
              onClick={resetForm}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: inputBg, color: textSecondary, border: `1px solid ${inputBorder}` }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ─── Uploaded Documents List ───────────────────── */}
      <div className={`fade-up delay-400 ${inView ? "in-view" : ""}`}>
        <button
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="flex items-center justify-between w-full mb-4"
        >
          <h2 className="text-sm font-medium" style={{ color: textSecondary }}>
            Uploaded Documents ({documents.length})
          </h2>
          {docsExpanded ? <ChevronUp size={16} style={{ color: textMuted }} /> : <ChevronDown size={16} style={{ color: textMuted }} />}
        </button>

        {docsExpanded && (
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div
                className="rounded-xl p-12 text-center"
                style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
              >
                <FileText size={32} className="mx-auto mb-3" style={{ color: textFaint }} />
                <p className="text-sm" style={{ color: textSecondary }}>No documents uploaded yet.</p>
              </div>
            ) : (
              documents.map((doc, i) => {
                const statusCfg = STATUS_CONFIG[doc.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <div
                    key={doc.id}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "var(--shadow-card)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(34,197,94,0.1)" }}
                      >
                        <FileText size={18} style={{ color: "#22C55E" }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: textPrimary }}>{doc.title}</div>
                        <div className="text-xs" style={{ color: textMuted }}>
                          {DOC_TYPE_LABELS[doc.type]} · {doc.fileName}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: textFaint }}>
                          Submitted {doc.submittedAt}
                          {doc.reviewedAt && ` · Reviewed ${doc.reviewedAt}`}
                          {doc.reviewerNote && <span style={{ color: "#EF4444" }}> · &quot;{doc.reviewerNote}&quot;</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: `${statusCfg.color}18`, color: statusCfg.color }}
                      >
                        <StatusIcon size={13} />
                        {statusCfg.label}
                      </span>
                      <button onClick={() => handlePreview(doc.id, doc.fileName, doc.title)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Preview">
                        <Eye size={14} className="text-gray-600 hover:text-blue-400" />
                      </button>
                      <button onClick={() => handleDownload(doc.id, doc.fileName)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Download">
                        <Download size={14} className="text-gray-600 hover:text-emerald-400" />
                      </button>
                      {doc.status === "pending" && (
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Remove">
                          <Trash2 size={14} className="text-gray-600 hover:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ─── Preview Modal ─────────────────────────────── */}
      {previewDoc && (
        <DocumentPreview
          downloadUrl={previewDoc.downloadUrl}
          fileName={previewDoc.fileName}
          title={previewDoc.title}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
