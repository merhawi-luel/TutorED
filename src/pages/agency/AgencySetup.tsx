import { useTheme } from "@/context/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { Building2, MapPin, BookOpen, CheckCircle2, ChevronDown, X } from "lucide-react";
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
  "Science",
  "Art",
  "Music",
  "Psychology",
  "Business Studies",
  "Spanish",
  "French",
];

export default function AgencySetup({ onComplete }: AgencySetupProps) {
  const { colors, isDark } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { refetchAgencyData } = useData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const selectAllSubjects = () => {
    setSelectedSubjects(SUBJECT_OPTIONS);
  };

  const clearAllSubjects = () => {
    setSelectedSubjects([]);
  };

  const removeSubject = (subject: string) => {
    setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
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
      style={{ background: colors.bgPage }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl p-8"
        style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: colors.accentBg }}
          >
            <Building2 size={32} style={{ color: colors.accent }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            Welcome to Mentora!
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Let's set up your organization to start recruiting tutors
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Organization Name <span style={{ color: colors.dangerColor }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ABC Education Center"
              className="w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
              style={{
                background: colors.bgInput,
                border: `1px solid ${colors.borderColor}`,
                color: colors.textPrimary,
              }}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about your organization..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg transition-all resize-none focus:outline-none focus:ring-2"
              style={{
                background: colors.bgInput,
                border: `1px solid ${colors.borderColor}`,
                color: colors.textPrimary,
              }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              Location
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: colors.textMuted }}
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Addis Ababa"
                className="w-full pl-10 pr-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2"
                style={{
                  background: colors.bgInput,
                  border: `1px solid ${colors.borderColor}`,
                  color: colors.textPrimary,
                }}
              />
            </div>
          </div>

          {/* Subjects - Multi-Select Dropdown */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
              <BookOpen size={16} className="inline mr-2" />
              Subjects You Recruit For
            </label>
            
            {/* Selected subjects display */}
            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSubjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: colors.accentBg,
                      color: colors.accent,
                      border: `1px solid ${colors.accentBorder}`,
                    }}
                  >
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="hover:opacity-70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Dropdown button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all"
              style={{
                background: colors.bgInput,
                border: `1px solid ${colors.borderColor}`,
                color: colors.textSecondary,
              }}
            >
              <span>
                {selectedSubjects.length === 0
                  ? "Select subjects..."
                  : `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`}
              </span>
              <ChevronDown
                size={18}
                className="transition-transform"
                style={{
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div
                className="absolute z-10 w-full mt-2 rounded-lg shadow-lg overflow-hidden"
                style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.borderColor}`,
                  maxHeight: "320px",
                }}
              >
                {/* Select All / Clear All buttons */}
                <div
                  className="flex gap-2 p-2"
                  style={{ borderBottom: `1px solid ${colors.borderColor}` }}
                >
                  <button
                    type="button"
                    onClick={selectAllSubjects}
                    className="flex-1 px-3 py-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: colors.accentBg,
                      color: colors.accent,
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllSubjects}
                    className="flex-1 px-3 py-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: colors.bgInput,
                      color: colors.textSecondary,
                      border: `1px solid ${colors.borderColor}`,
                    }}
                  >
                    Clear All
                  </button>
                </div>

                {/* Subject options */}
                <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
                  {SUBJECT_OPTIONS.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className="w-full px-4 py-2 text-left text-sm transition-all flex items-center gap-2 hover:brightness-110"
                        style={{
                          background: isSelected ? colors.accentBg : "transparent",
                          color: isSelected ? colors.accent : colors.textSecondary,
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                          style={{
                            border: `2px solid ${isSelected ? colors.accent : colors.borderColor}`,
                            background: isSelected ? colors.accent : "transparent",
                          }}
                        >
                          {isSelected && <CheckCircle2 size={12} color="white" />}
                        </div>
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                background: colors.dangerBg,
                border: `1px solid ${colors.dangerBorder}`,
                color: colors.dangerColor,
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: colors.accent,
              color: isDark ? colors.textPrimary : "white",
            }}
          >
            {loading ? "Creating Organization..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
