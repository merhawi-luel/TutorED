import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { Building2, MapPin, BookOpen, CheckCircle2 } from "lucide-react";
import { agencyApi } from "@/lib/api";
import { useData } from "@/context/DataContext";

interface AgencySetupProps {
  onComplete: () => void;
}

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Amharic",
  "History",
  "Geography",
  "Economics",
  "Computer Science",
];

export default function AgencySetup({ onComplete }: AgencySetupProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { refetchAgencyData } = useData();

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);

    try {
      await agencyApi.createOrganization({
        name: name.trim(),
        description: description.trim(),
        location: location.trim(),
        subjects: selectedSubjects,
      });

      // Refresh organization data in DataContext
      await refetchAgencyData();

      // Notify parent to trigger re-render
      onComplete();
    } catch (err: any) {
      console.error("Setup error:", err);
      
      // Parse error message
      let message = "Failed to create organization. Please try again.";
      
      if (err.message) {
        if (err.message.includes("already exists")) {
          message = "Organization already exists. Please refresh the page. If this persists, contact support.";
        } else if (err.message.includes("Network") || err.message.includes("Failed to fetch")) {
          message = "Network error. Check your connection and try again.";
        } else {
          message = err.message;
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-8"
        style={{ background: "#0A0A0A", border: "1px solid var(--border-color)" }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-bg)" }}
          >
            <Building2 size={32} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome to EduVerify!</h1>
          <p className="text-[var(--text-secondary)]">Let's set up your organization to start recruiting tutors</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ABC Education Center"
              className="w-full px-4 py-3 rounded-lg text-[var(--text-primary)] transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your organization..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg text-[var(--text-primary)] transition-all resize-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Addis Ababa"
                className="w-full pl-10 pr-4 py-3 rounded-lg text-[var(--text-primary)] transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <BookOpen size={16} className="inline mr-2" />
              Subjects You Recruit For
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECT_OPTIONS.map((subject) => {
                const isSelected = selectedSubjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: isSelected ? "var(--accent-bg)" : "var(--bg-card)",
                      border: isSelected
                        ? "1px solid rgba(34,197,94,0.5)"
                        : "1px solid var(--border-color)",
                      color: isSelected ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    {isSelected && <CheckCircle2 size={14} className="inline mr-1" />}
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{ background: "var(--danger-bg)", border: "1px solid var(--danger-border)" }}
            >
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "var(--accent)",
              color: "black",
            }}
          >
            {loading ? "Creating Organization..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
