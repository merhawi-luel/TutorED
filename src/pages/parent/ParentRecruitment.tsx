import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { ALL_SUBJECTS, ALL_GRADES } from "@/data/constants";
import {
  Building2,
  Send,
  CheckCircle,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  ChevronDown,
  X,
} from "lucide-react";

interface Agency {
  id: string;
  name: string;
  description: string;
  location: string;
  subjects: string[];
  isVerified: boolean;
}

export default function ParentRecruitment() {
  const { user } = useAuth();
  const { ref, inView } = useInView();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loadingAgencies, setLoadingAgencies] = useState(true);

  const [selectedAgency, setSelectedAgency] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setPhone("");
    }
  }, [user]);

  useEffect(() => {
    setLoadingAgencies(true);
    parentApi
      .getAgencies()
      .then((data) => {
        setAgencies(
          data.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description || "",
            location: a.location || "",
            subjects: a.subjects || [],
            isVerified: a.isVerified || a.is_verified || false,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoadingAgencies(false));
  }, []);

  const selectedAgencyData = agencies.find((a) => a.id === selectedAgency);

  const toggleSubject = (s: string) => {
    setSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleGrade = (g: string) => {
    setGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleSubmit = async () => {
    if (subjects.length === 0 || grades.length === 0) return;
    if (!selectedAgency) {
      setError("Please select an agency.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await parentApi.contactAgency({
        organizationId: selectedAgency,
        subjects,
        grades,
        location,
        notes,
        parentName: user?.name || "",
        parentEmail: user?.email || "",
        parentPhone: phone,
      });
      setSent(true);
      setSubjects([]);
      setGrades([]);
      setLocation("");
      setPhone("");
      setNotes("");
      setSelectedAgency("");
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to send request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-color)",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Find a Recruiter
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Let a verified agency handle the entire recruitment process for you.
        </p>
      </div>

      {/* Success message */}
      {sent && (
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <CheckCircle size={18} />
          <div className="flex-1">
            <span className="font-medium">Request sent successfully!</span>
            <span className="text-[var(--text-secondary)] ml-2">
              {selectedAgencyData?.name || "The agency"} will review your request.
            </span>
          </div>
          <Link
            to="/parent/requests"
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
          >
            View Requests <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-bg)",
            color: "var(--danger-color)",
          }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Form */}
      <div
        className={`rounded-xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
        }}
      >
        {/* Agency Selection */}
        <div>
          <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2 mb-4">
            <Building2 size={16} style={{ color: "var(--badge-info-color)" }} />
            Select an Agency
          </h3>

          {loadingAgencies ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] py-4">
              <Loader2 size={16} className="animate-spin" />
              Loading agencies...
            </div>
          ) : agencies.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)] py-4">
              No verified agencies found. Try again later.
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer"
                style={inputStyle}
              >
                <option value="">Choose an agency...</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                    {agency.isVerified ? " ✓ Verified" : ""}
                    {agency.location ? ` — ${agency.location}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]"
              />

              {/* Show selected agency details */}
              {selectedAgencyData && (
                <div
                  className="mt-3 rounded-xl p-4"
                  style={{
                    background: "rgba(59,130,246,0.06)",
                    border: "1px solid rgba(59,130,246,0.15)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {selectedAgencyData.name}
                    </span>
                    {selectedAgencyData.isVerified && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: "var(--accent-bg)",
                          color: "var(--accent)",
                        }}
                      >
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">
                    {selectedAgencyData.description}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text-faint)]">
                    <MapPin size={12} />
                    {selectedAgencyData.location || "Location not set"}
                  </div>
                  {selectedAgencyData.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedAgencyData.subjects.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            background: "rgba(59,130,246,0.1)",
                            color: "var(--badge-info-color)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                      {selectedAgencyData.subjects.length > 6 && (
                        <span className="text-[10px] text-[var(--text-faint)]">
                          +{selectedAgencyData.subjects.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Subjects — Checkbox Grid */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Subjects Needed{" "}
            <span className="text-[var(--text-faint)] text-xs">
              (select one or more)
            </span>
          </label>
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {subjects.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "var(--accent-bg)",
                    color: "var(--accent)",
                  }}
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => toggleSubject(s)}
                    className="hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-color)",
            }}
          >
            {ALL_SUBJECTS.map((s) => {
              const checked = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left"
                  style={{
                    background: checked
                      ? "var(--accent-bg)"
                      : "var(--bg-input)",
                    border: `1px solid ${checked ? "var(--accent-border)" : "var(--border-color)"}`,
                    color: checked
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                    style={{
                      border: `1.5px solid ${checked ? "var(--accent)" : "var(--border-color)"}`,
                      background: checked ? "var(--accent)" : "transparent",
                    }}
                  >
                    {checked && (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grades — Checkbox Grid */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-2">
            Grade Levels{" "}
            <span className="text-[var(--text-faint)] text-xs">
              (select one or more)
            </span>
          </label>
          {grades.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {grades.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
                  style={{
                    background: "var(--accent-bg)",
                    color: "var(--accent)",
                  }}
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => toggleGrade(g)}
                    className="hover:opacity-70"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid var(--border-color)",
            }}
          >
            {ALL_GRADES.map((g) => {
              const checked = grades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGrade(g)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left"
                  style={{
                    background: checked
                      ? "var(--accent-bg)"
                      : "var(--bg-input)",
                    border: `1px solid ${checked ? "var(--accent-border)" : "var(--border-color)"}`,
                    color: checked
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0"
                    style={{
                      border: `1.5px solid ${checked ? "var(--accent)" : "var(--border-color)"}`,
                      background: checked ? "var(--accent)" : "transparent",
                    }}
                  >
                    {checked && (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Your Contact Information
          </label>
          <div
            className="rounded-xl px-4 py-3 space-y-2"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  Name
                </div>
                <div className="text-sm text-[var(--text-primary)]">
                  {user?.name || "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--text-muted)] uppercase">
                  Email
                </div>
                <div className="text-sm text-[var(--text-primary)]">
                  {user?.email || "—"}
                </div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase mb-1">
                Phone (optional)
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                }}
                placeholder="e.g. +251 9XX XXX XXX"
              />
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-faint)] mt-1">
            The agency will use this information to contact you.
          </p>
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={inputStyle}
            placeholder="e.g. Addis Ababa"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1.5">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={inputStyle}
            placeholder="Budget, schedule preferences, specific requirements..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={
              sending ||
              sent ||
              subjects.length === 0 ||
              grades.length === 0 ||
              !selectedAgency
            }
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            style={{
              background: "var(--badge-info-color)",
              color: "white",
            }}
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : sent ? (
              <CheckCircle size={16} />
            ) : (
              <Send size={16} />
            )}
            {sending
              ? "Sending..."
              : sent
                ? "Request Sent!"
                : "Send to Agency"}
          </button>
        </div>
      </div>
    </div>
  );
}
