import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { Save, CheckCircle } from "lucide-react";

const GRADES = [
  "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12",
];

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics",
];

export default function ParentProfile() {
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [childrenGrades, setChildrenGrades] = useState<string[]>([]);
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    parentApi.getProfile().then((p) => {
      setPhone(p.phone || "");
      setLocation(p.location || "");
      setChildrenGrades(p.childrenGrades || p.children_grades || []);
      setPreferredSubjects(p.preferredSubjects || p.preferred_subjects || []);
      setNotes(p.notes || "");
    }).catch(() => {});
  }, []);

  const toggleGrade = (g: string) => {
    setChildrenGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleSubject = (s: string) => {
    setPreferredSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSave = async () => {
    try {
      await parentApi.updateProfile({ phone, location, childrenGrades, preferredSubjects, notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">My Profile</h1>
        <p className="text-sm text-gray-400 mt-1">Tell us about your tutoring needs.</p>
      </div>

      <div className={`rounded-xl p-6 space-y-6 fade-up delay-100 ${inView ? "in-view" : ""}`} style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
              style={inputStyle}
              placeholder="+251 9XX XXX XXX"
            />
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
        </div>

        {/* Children's Grades */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Children's Grades</label>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGrade(g)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: childrenGrades.includes(g) ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${childrenGrades.includes(g) ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)"}`,
                  color: childrenGrades.includes(g) ? "#22C55E" : "#9CA3AF",
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Subjects */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Preferred Subjects</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSubject(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: preferredSubjects.includes(s) ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${preferredSubjects.includes(s) ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)"}`,
                  color: preferredSubjects.includes(s) ? "#22C55E" : "#9CA3AF",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
            style={inputStyle}
            placeholder="Any specific requirements or preferences for the tutor..."
          />
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{ background: "#22C55E", color: "black" }}
          >
            {saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
