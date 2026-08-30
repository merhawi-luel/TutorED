import { useState } from "react";
import { useData } from "@/context/DataContext";
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

  const inputStyle = {
    background: "#0D0D0D",
    border: "1px solid #1F1F1F",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Build your professional teaching identity.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          <Save size={16} />
          {saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {/* Basic Info */}
      <section
        className={`rounded-2xl p-6 space-y-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Basic Information</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Headline</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Mathematics Tutor"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
            style={inputStyle}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell agencies about your teaching experience and approach..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={inputStyle}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min={0}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Education</label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. BSc Mathematics"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Addis Ababa"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Teaching Mode</label>
            <select
              value={teachingMode}
              onChange={(e) => setTeachingMode(e.target.value as TeachingMode)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
            >
              <option value="in-person">In-person</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Availability</label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Monday - Saturday"
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
        <h2 className="text-sm font-medium text-gray-300">Subjects</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((s) => {
            const selected = subjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: selected ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: selected ? "#22C55E" : "#9CA3AF",
                }}
              >
                {selected && <X size={12} />}
                {s}
              </button>
            );
          })}
          <button
            className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
            style={{ background: "transparent", border: "1px dashed rgba(255,255,255,0.12)", color: "#6B7280" }}
          >
            <Plus size={12} />
            Custom
          </button>
        </div>
      </section>

      {/* Grades */}
      <section
        className={`rounded-2xl p-6 space-y-4 fade-up delay-300 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <h2 className="text-sm font-medium text-gray-300">Grades</h2>
        <div className="flex flex-wrap gap-2">
          {GRADE_OPTIONS.map((g) => {
            const selected = grades.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleGrade(g)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: selected ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: selected ? "#22C55E" : "#9CA3AF",
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
