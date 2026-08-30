import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Building2,
  User,
  Send,
  CheckCircle,
  MapPin,
  AlertCircle,
  Loader2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science",
];

const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12",
];

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

  const [mode, setMode] = useState<"agency" | "self">("agency");
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill contact info from user profile
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

  const handleSubmit = async () => {
    if (!subject || !grade) return;
    if (mode === "agency" && !selectedAgency) {
      setError("Please select an agency.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await parentApi.contactAgency({
        organizationId: mode === "agency" ? selectedAgency! : undefined,
        subject,
        grade,
        location,
        notes,
        parentName: user?.name || "",
        parentEmail: user?.email || "",
        parentPhone: phone,
      });
      setSent(true);
      // Reset form
      setSubject("");
      setGrade("");
      setLocation("");
      setPhone("");
      setNotes("");
      setSelectedAgency(null);
      setTimeout(() => setSent(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to send request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Find a Tutor</h1>
        <p className="text-sm text-gray-400 mt-1">
          Choose how you'd like to find the right tutor for your child.
        </p>
      </div>

      {/* Success message */}
      {sent && (
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle size={18} />
          <div className="flex-1">
            <span className="font-medium">Request sent successfully!</span>
            <span className="text-gray-400 ml-2">
              {mode === "agency"
                ? `${selectedAgencyData?.name || "The agency"} will review your request.`
                : "Your request is now visible to agencies."}
            </span>
          </div>
          <Link
            to="/parent/requests"
            className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
          >
            View Requests <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#F87171" }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Mode Selector */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        <button
          onClick={() => setMode("agency")}
          className="text-left rounded-xl p-5 transition-all"
          style={{
            background: mode === "agency" ? "rgba(59,130,246,0.1)" : "#111111",
            border: `1px solid ${mode === "agency" ? "rgba(59,130,246,0.35)" : "#1F1F1F"}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Building2 size={20} style={{ color: mode === "agency" ? "#3B82F6" : "#6B7280" }} />
            <span className="text-sm font-medium" style={{ color: mode === "agency" ? "#3B82F6" : "#9CA3AF" }}>
              Agency-Assisted
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Let a verified agency handle the entire recruitment process for you.
          </p>
        </button>

        <button
          onClick={() => setMode("self")}
          className="text-left rounded-xl p-5 transition-all"
          style={{
            background: mode === "self" ? "rgba(34,197,94,0.1)" : "#111111",
            border: `1px solid ${mode === "self" ? "rgba(34,197,94,0.35)" : "#1F1F1F"}`,
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <User size={20} style={{ color: mode === "self" ? "#22C55E" : "#6B7280" }} />
            <span className="text-sm font-medium" style={{ color: mode === "self" ? "#22C55E" : "#9CA3AF" }}>
              Self-Recruitment
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Browse profiles and vacancies yourself. Contact and hire tutors directly.
          </p>
        </button>
      </div>

      {/* Form */}
      <div className={`rounded-xl p-6 space-y-5 fade-up delay-200 ${inView ? "in-view" : ""}`} style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
        {mode === "agency" && (
          <>
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <Building2 size={16} style={{ color: "#3B82F6" }} />
              Select an Agency
            </h3>

            {loadingAgencies ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 size={16} className="animate-spin" />
                Loading agencies...
              </div>
            ) : agencies.length === 0 ? (
              <div className="text-sm text-gray-500 py-4">
                No verified agencies found. Try again later.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {agencies.map((agency) => {
                  const isSelected = selectedAgency === agency.id;
                  return (
                    <button
                      key={agency.id}
                      onClick={() => setSelectedAgency(agency.id)}
                      className="text-left rounded-xl p-4 transition-all"
                      style={{
                        background: isSelected ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{agency.name}</span>
                        {agency.isVerified && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
                          >
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{agency.description}</div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                        <MapPin size={12} />
                        {agency.location || "Location not set"}
                      </div>
                      {agency.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agency.subjects.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 rounded text-[10px]"
                              style={{ background: "rgba(59,130,246,0.1)", color: "#60A5FA" }}
                            >
                              {s}
                            </span>
                          ))}
                          {agency.subjects.length > 4 && (
                            <span className="text-[10px] text-gray-600">+{agency.subjects.length - 4}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {mode === "self" && (
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
          >
            <BookOpen size={16} style={{ color: "#22C55E" }} />
            <div className="text-xs text-gray-400">
              Fill in your requirements below, then browse{" "}
              <Link to="/parent/vacancies" className="font-medium" style={{ color: "#22C55E" }}>
                available vacancies
              </Link>{" "}
              to find a tutor directly.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Subject Needed</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            >
              <option value="">Select subject...</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Grade Level</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            >
              <option value="">Select grade...</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Your Contact Information</label>
          <div className="rounded-xl px-4 py-3 space-y-2" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Name</div>
                <div className="text-sm text-white">{user?.name || "—"}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 uppercase">Email</div>
                <div className="text-sm text-white">{user?.email || "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase mb-1">Phone (optional)</div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
                style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                placeholder="e.g. +251 9XX XXX XXX"
              />
            </div>
          </div>
          <p className="text-[10px] text-gray-600 mt-1">The agency will use this information to contact you.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={inputStyle}
            placeholder="e.g. Addis Ababa"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={inputStyle}
            placeholder="Budget, schedule preferences, specific requirements..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={sending || sent || !subject || !grade || (mode === "agency" && !selectedAgency)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            style={{ background: mode === "agency" ? "#3B82F6" : "#22C55E", color: "white" }}
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
              : mode === "agency"
              ? "Send to Agency"
              : "Post Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
