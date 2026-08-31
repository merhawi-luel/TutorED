import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import { Save, Plus, X } from "lucide-react";
import type { TeachingMode } from "@/types";

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Amharic",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
];

const GRADE_OPTIONS = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

export default function TutorProfile() {
  const { tutorProfile, updateProfile } = useData();
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  const [headline, setHeadline] = useState(tutorProfile?.headline ?? "");
  const [bio, setBio] = useState(tutorProfile?.bio ?? "");
  const [subjects, setSubjects] = useState<string[]>(tutorProfile?.subjects ?? []);
  const [grades, setGrades] = useState<string[]>(tutorProfile?.grades ?? []);
  const [experience, setExperience] = useState(tutorProfile?.experience ?? 0);
  const [education, setEducation] = useState(tutorProfile?.education ?? "");
  const [location, setLocation] = useState(tutorProfile?.location ?? "");
  const [teachingMode, setTeachingMode] = useState<TeachingMode>(tutorProfile?.teachingMode ?? "in-person");
  const [availability, setAvailability] = useState(tutorProfile?.availability ?? "");
  const [saved, setSaved] = useState(false);

  const toggleSubject = (s: string) => {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const toggleGrade = (g: string) => {
    setGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSave = () => {
    updateProfile({ headline, bio, subjects, grades, experience, education, location, teachingMode, availability });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const cardBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const inputBg = isDark ? "#0D0D0D" : "#F1F5F9";
  const inputBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const textPrimary = isDark ? "#FFFFFF" : "#0F172A";
  const textSecondary = isDark ? "#9CA3AF" : "#475569";
  const textMuted = isDark ? "#6B7280" : "#94A3B8";
  const pillBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const pillBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>My Profile</h1>
          <p className="text-sm mt-1" style={{ color: textSecondary }}>Build your professional teaching identity.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: "#22C55E", color: "black", minWidth: 180, justifyContent: "center" }}
        >
          <Save size={16} />
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {/* Basic Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Basic Information</h2>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Headline</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Mathematics Tutor"
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell agencies about your teaching experience and approach..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Years of Experience</label>
            <input
              type="number"
              min={0}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Education</label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BSc Mathematics"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Addis Ababa"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Teaching Mode</label>
            <select
              value={teachingMode}
              onChange={(e) => setTeachingMode(e.target.value as TeachingMode)}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
            >
              <option value="in-person">In-person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: textMuted }}>Availability</label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Monday - Saturday"
            className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />
        </div>
      </section>

      {/* Subjects */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-200 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((s) => {
            const selected = subjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: selected ? "rgba(34,197,94,0.15)" : pillBg,
                  border: `1px solid ${selected ? "rgba(34,197,94,0.3)" : pillBorder}`,
                  color: selected ? "#22C55E" : textSecondary,
                }}
              >
                {selected && <X size={12} />}
                {s}
              </button>
            );
          })}
          <button
            className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            style={{ background: "transparent", border: `1px dashed ${pillBorder}`, color: textMuted }}
          >
            <Plus size={12} />
            Custom
          </button>
        </div>
      </section>

      {/* Grades */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <h2 className="text-sm font-medium" style={{ color: textSecondary }}>Grades</h2>
        <div className="flex flex-wrap gap-2">
          {GRADE_OPTIONS.map((g) => {
            const selected = grades.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: selected ? "rgba(34,197,94,0.15)" : pillBg,
                  border: `1px solid ${selected ? "rgba(34,197,94,0.3)" : pillBorder}`,
                  color: selected ? "#22C55E" : textSecondary,
                }}
              >
                {selected && <X size={12} />}
                {g}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
