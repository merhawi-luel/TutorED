import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { X, Download, FileText, Loader2, AlertCircle } from "lucide-react";

interface DocumentPreviewProps {
  downloadUrl: string;
  fileName: string;
  title: string;
  onClose: () => void;
}

function getFileType(fileName: string): "pdf" | "image" | "unknown" {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png"].includes(ext)) return "image";
  return "unknown";
}

export default function DocumentPreview({ downloadUrl, fileName, title, onClose }: DocumentPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileType = getFileType(fileName);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative flex flex-col w-full h-full sm:w-[90vw] sm:h-[85vh] sm:max-w-5xl sm:rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-bg)" }}
            >
              <FileText size={16} style={{ color: "var(--accent)" }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">{title}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{fileName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Download size={14} />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 relative" style={{ background: "#0A0A0A" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <AlertCircle size={32} style={{ color: "var(--danger-color)" }} />
              <p className="text-sm text-[var(--text-secondary)]">Failed to load preview</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
              >
                <Download size={14} />
                Download instead
              </button>
            </div>
          )}

          {fileType === "pdf" && (
            <iframe
              src={downloadUrl}
              className="w-full h-full border-0"
              onLoad={() => setLoading(false)}
              onError={() => { setLoading(false); setError(true); }}
              title={title}
            />
          )}

          {fileType === "image" && (
            <div className="w-full h-full flex items-center justify-center p-4 overflow-auto">
              <img
                src={downloadUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                onLoad={() => setLoading(false)}
                onError={() => { setLoading(false); setError(true); }}
              />
            </div>
          )}

          {fileType === "unknown" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <FileText size={32} style={{ color: "var(--text-muted)" }} />
              <p className="text-sm text-[var(--text-secondary)]">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
              >
                <Download size={14} />
                Download file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
