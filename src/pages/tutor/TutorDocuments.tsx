import { useState } from "react";
import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  Trash2,
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
  verified: { icon: CheckCircle2, color: "#22C55E", label: "Verified" },
  pending: { icon: Clock, color: "#F59E0B", label: "Pending" },
  under_review: { icon: Eye, color: "#3B82F6", label: "Under Review" },
  rejected: { icon: XCircle, color: "#EF4444", label: "Rejected" },
  expired: { icon: AlertCircle, color: "#6B7280", label: "Expired" },
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

export default function TutorDocuments() {
  const { documents, addDocument } = useMockData();
  const { ref, inView } = useInView();
  const [showUpload, setShowUpload] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("government_id");
  const [docTitle, setDocTitle] = useState("");
  const [fileName, setFileName] = useState("");

  const handleUpload = () => {
    if (!docTitle || !fileName) return;
    addDocument({ tutorId: "u1", type: docType, title: docTitle, fileName });
    setShowUpload(false);
    setDocTitle("");
    setFileName("");
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Documents</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload and manage your credentials. All documents are kept private.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div
          className={`rounded-2xl p-6 space-y-4 fade-up ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <h2 className="text-sm font-medium text-gray-300">Upload New Document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              >
                {DOC_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Title</label>
              <input
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. My Degree Certificate"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
              />
            </div>
          </div>

          {/* File drop zone */}
          <div
            className="rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-emerald-500/30"
            style={{ background: "#0D0D0D", border: "2px dashed #1F1F1F" }}
            onClick={() => setFileName("uploaded_document.pdf")}
          >
            <Upload size={24} className="mx-auto mb-3 text-gray-600" />
            {fileName ? (
              <p className="text-sm text-emerald-400">{fileName}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">Click to select a file</p>
                <p className="text-xs text-gray-600 mt-1">PDF, JPG, or PNG — Max 10MB</p>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              disabled={!docTitle || !fileName}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "#22C55E", color: "black" }}
            >
              Submit Document
            </button>
            <button
              onClick={() => setShowUpload(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "#161616", color: "#9CA3AF", border: "1px solid #1F1F1F" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className={`space-y-3 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        <h2 className="text-sm font-medium text-gray-400">
          Uploaded Documents ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <FileText size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          documents.map((doc, i) => {
            const statusCfg = STATUS_CONFIG[doc.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <FileText size={18} style={{ color: "#22C55E" }} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{doc.title}</div>
                    <div className="text-xs text-gray-500">
                      {DOC_TYPE_LABELS[doc.type]} · {doc.fileName}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Submitted {doc.submittedAt}
                      {doc.reviewedAt && ` · Reviewed ${doc.reviewedAt}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: `${statusCfg.color}18`, color: statusCfg.color }}
                  >
                    <StatusIcon size={13} />
                    {statusCfg.label}
                  </span>
                  {doc.status === "pending" && (
                    <button className="p-1.5 rounded-lg transition-colors hover:bg-white/5" title="Remove">
                      <Trash2 size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
