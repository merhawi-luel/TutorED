import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { Save, CheckCircle2 } from "lucide-react";

const SUBJECT_OPTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Amharic", "History", "Geography", "Computer Science", "Economics", "Science",
];

export default function AgencyOrganization() {
  const { agencyOrganization, updateOrganization } = useData();
  const { ref, inView } = useInView();

  const [name, setName] = useState(agencyOrganization.name);
  const [description, setDescription] = useState(agencyOrganization.description);
  const [location, setLocation] = useState(agencyOrganization.location);
  const [subjects, setSubjects] = useState<string[]>(agencyOrganization.subjects);
  const [saved, setSaved] = useState(false);

  const toggleSubject = (s: string) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSave = () => {
    updateOrganization({ name, description, location, subjects });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Organization Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your agency's public profile.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          <Save size={16} />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Verification Badge */}
      {agencyOrganization.isVerified && (
        <div
          className={`rounded-xl px-5 py-3 flex items-center gap-3 text-sm fade-up delay-50 ${inView ? "in-view" : ""}`}
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <CheckCircle2 size={16} style={{ color: "#22C55E" }} />
          <span style={{ color: "#4ADE80" }}>Verified Organization</span>
          <span className="text-xs text-gray-500">— Your agency is verified on the platform.</span>
        </div>
      )}

      {/* Basic Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Organization Details</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Organization Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={inputStyle}
          />
        </div>
      </section>

      {/* Subjects */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Subjects Offered</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((s) => {
            const selected = subjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: selected ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: selected ? "#22C55E" : "#9CA3AF",
                }}
              >
                {selected ? `✓ ${s}` : s}
              </button>
            );
          })}
        </div>
      </section>

      {/* Preview */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Profile Preview</h2>
        <div
          className="rounded-xl p-5"
          style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
            >
              {name[0] ?? "E"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{name || "Organization Name"}</span>
                {agencyOrganization.isVerified && (
                  <CheckCircle2 size={14} style={{ color: "#22C55E" }} />
                )}
              </div>
              <div className="text-xs text-gray-500">{location}</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            {description || "Organization description will appear here."}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {subjects.map((s) => (
              <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
