import { useTheme } from "@/context/ThemeContext";
import { useState, useRef } from "react";
import { useData } from "@/context/DataContext";
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
} from "lucide-react";
import type { DocumentType, DocumentStatus } from "@/types";

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
  verified: { icon: CheckCircle2, color: "var(--accent)", label: "Verified" },
  pending: { icon: Clock, color: "var(--badge-pending-color)", label: "Pending" },
  under_review: { icon: Eye, color: "var(--badge-info-color)", label: "Under Review" },
  rejected: { icon: XCircle, color: "var(--danger-color)", label: "Rejected" },
  expired: { icon: AlertCircle, color: "var(--text-muted)", label: "Expired" },
};

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

export default function TutorDocuments() {
  const { documents, addDocument, removeDocument } = useData();
  const { ref, inView } = useInView();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("government_id");
  const [docTitle, setDocTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<{ downloadUrl: string; fileName: string; title: string } | null>(null);

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

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file to storage");
      }

      setUploadProgress("Saving document record...");
      // addDocument in DataContext will handle optimistic update + API call
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
      console.error("Upload error:", err);
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
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download document.");
      setTimeout(() => setError(null), 2500);
    }
  };

  const handlePreview = async (docId: string, fileName: string, title: string) => {
    try {
      const { downloadUrl } = await tutorApi.downloadDocument(docId);
      setPreviewDoc({ downloadUrl, fileName, title });
    } catch (err) {
      console.error("Preview error:", err);
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

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Documents</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Upload and manage your credentials. All documents are kept private.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Success / Error Messages */}
      {success && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}
        >
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
      {error && !showUpload && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bg)", color: "var(--danger-color)" }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Upload Form */}
      {showUpload && (
        <div
          className={`rounded-2xl p-6 space-y-4 fade-up ${inView ? "in-view" : ""}`}
          style={{ background: "var(--bg-card)", border: "1px solid var(--accent-border)" }}
        >
          <h2 className="text-sm font-medium text-gray-300">Upload New Document</h2>

          {error && (
            <div
              className="rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm"
              style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-bg)", color: "var(--danger-color)" }}
            >
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
              >
                {DOC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">Title</label>
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. My Degree Certificate"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
              />
            </div>
          </div>

          {/* File drop zone */}
          <div
            className={`rounded-xl p-8 text-center transition-colors ${
              selectedFile ? "border-emerald-500/50" : "hover:border-emerald-500/30"
            }`}
            style={{
              background: "var(--bg-input)",
              border: `2px dashed ${selectedFile ? "var(--accent-border)" : "var(--border-color)"}`,
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
              <>
                <Loader2 size={24} className="mx-auto mb-3 text-emerald-400 animate-spin" />
                <p className="text-sm text-emerald-400">{uploadProgress}</p>
              </>
            ) : selectedFile ? (
              <>
                <FileText size={24} className="mx-auto mb-3 text-emerald-400" />
                <p className="text-sm text-emerald-400 font-medium">{selectedFile.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Remove file
                </button>
              </>
            ) : (
              <>
                <Upload size={24} className="mx-auto mb-3 text-[var(--text-faint)]" />
                <p className="text-sm text-[var(--text-secondary)]">Click to select or drag & drop a file</p>
                <p className="text-xs text-[var(--text-faint)] mt-1">PDF, JPG, or PNG — Max 10MB</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!docTitle || !selectedFile || uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 flex items-center gap-2"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Submit Document
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "var(--bg-input)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className={`space-y-3 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Uploaded Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <FileText size={32} className="mx-auto mb-3 text-[var(--text-faint)]" />
            <p className="text-sm text-[var(--text-secondary)]">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map((doc, i) => {
            const statusCfg = STATUS_CONFIG[doc.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent-bg)" }}
                  >
                    <FileText size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{doc.title}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {DOC_TYPE_LABELS[doc.type]} · {doc.fileName}
                    </div>
                    <div className="text-xs text-[var(--text-faint)] mt-0.5">
                      Submitted {doc.submittedAt}
                      {doc.reviewedAt && ` · Reviewed ${doc.reviewedAt}`}
                      {doc.reviewerNote && (
                        <span style={{ color: "var(--danger-color)" }}> · &quot;{doc.reviewerNote}&quot;</span>
                      )}
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
                  <button
                    onClick={() => handlePreview(doc.id, doc.fileName, doc.title)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    title="Preview"
                  >
                    <Eye size={14} className="text-[var(--text-faint)] hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc.id, doc.fileName)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                    title="Download"
                  >
                    <Download size={14} className="text-[var(--text-faint)] hover:text-emerald-400" />
                  </button>
                  {doc.status === "pending" && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      title="Remove"
                    >
                      <Trash2 size={14} className="text-[var(--text-faint)] hover:text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Preview Modal */}
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
