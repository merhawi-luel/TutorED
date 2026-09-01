import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import { ALL_SUBJECTS, ALL_GRADES } from "@/data/constants";
import {
  MapPin,
  Clock,
  DollarSign,
  GraduationCap,
  Plus,
  X,
  XCircle,
  CheckCircle2,
  Briefcase,
  Users,
} from "lucide-react";

interface VacancyItem {
  id: string;
  title: string;
  organizationName: string;
  subjects: string[];
  grades: string[];
  location: string;
  salary: string;
  deadline: string;
  teachingMode: string;
  description: string;
  parentId?: string;
  status: string;
}

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  "in-person": { bg: "var(--accent-bg)", color: "var(--accent)" },
  online: { bg: "rgba(59,130,246,0.12)", color: "var(--badge-info-color)" },
  hybrid: {
    bg: "rgba(168,85,247,0.12)",
    color: "var(--badge-purple-color)",
  },
};

export default function ParentVacancies({
  onBrowseApplicants,
}: {
  onBrowseApplicants?: (vacancyId: string) => void;
}) {
  const { ref, inView } = useInView();
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [myVacancyIds, setMyVacancyIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [teachingMode, setTeachingMode] = useState("in-person");
  const [salary, setSalary] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      parentApi.getVacancies(),
      parentApi.getMyVacancies(),
    ]).then(([allRes, myRes]) => {
      if (allRes.status === "fulfilled") {
        setVacancies(
          allRes.value.map((v: any) => ({
            id: v.id,
            title: v.title,
            organizationName:
              v.organizationName || v.organization_name || "Unknown",
            subjects: v.subjects || (v.subject ? [v.subject] : []),
            grades: v.grades || (v.grade ? [v.grade] : []),
            location: v.location || "",
            salary: v.salary || "Negotiable",
            deadline: v.deadline || "",
            teachingMode:
              v.teachingMode || v.teaching_mode || "in-person",
            description: v.description || "",
            parentId: v.parentId || v.parent_id,
            status: v.status,
          }))
        );
      }
      if (myRes.status === "fulfilled") {
        setMyVacancyIds(new Set(myRes.value.map((v: any) => v.id)));
      }
    }).catch(() => {});
  }, []);

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const toggleGrade = (g: string) => {
    setSelectedGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleCreate = async () => {
    if (!title || selectedSubjects.length === 0 || selectedGrades.length === 0)
      return;
    setSubmitting(true);
    try {
      const created = await parentApi.createVacancy({
        title,
        description,
        subjects: selectedSubjects,
        grades: selectedGrades,
        location,
        teachingMode,
        salary,
        deadline,
      });
      const newVacancy: VacancyItem = {
        id: created.id,
        title: created.title,
        organizationName: created.parentName || "You",
        subjects: created.subjects || selectedSubjects,
        grades: created.grades || selectedGrades,
        location: created.location || "",
        salary: created.salary || "Negotiable",
        deadline: created.deadline || "",
        teachingMode: created.teachingMode || "in-person",
        description: created.description || "",
        parentId: created.parentId,
        status: "open",
      };
      setVacancies((prev) => [newVacancy, ...prev]);
      setMyVacancyIds((prev) => new Set([...prev, created.id]));
      resetForm();
      setShowCreate(false);
      setSuccessMsg("Vacancy posted successfully! Tutors can now see it.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error("Failed to create vacancy:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (vacancyId: string) => {
    try {
      await parentApi.closeVacancy(vacancyId);
      setVacancies((prev) => prev.filter((v) => v.id !== vacancyId));
      setMyVacancyIds((prev) => {
        const next = new Set(prev);
        next.delete(vacancyId);
        return next;
      });
      setSuccessMsg("Vacancy deleted.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      console.error("Failed to close vacancy:", err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedSubjects([]);
    setSelectedGrades([]);
    setLocation("");
    setTeachingMode("in-person");
    setSalary("");
    setDeadline("");
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-color)",
  };

  const CheckboxButton = ({
    label,
    checked,
    onClick,
  }: {
    label: string;
    checked: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-left"
      style={{
        background: checked ? "var(--accent-bg)" : "var(--bg-input)",
        border: `1px solid ${checked ? "var(--accent-border)" : "var(--border-color)"}`,
        color: checked ? "var(--accent)" : "var(--text-secondary)",
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
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
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
      {label}
    </button>
  );

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div
        className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}
      >
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
            Browse Vacancies
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Explore tutoring positions or post your own vacancy for tutors to
            find.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? "Cancel" : "Post Vacancy"}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{
            background: "var(--accent-bg)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div
          className={`rounded-2xl p-6 space-y-4 fade-up ${inView ? "in-view" : ""}`}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <h2 className="text-sm font-medium text-gray-300">
            Post a Vacancy — Find a Tutor
          </h2>
          <p className="text-xs text-[var(--text-muted)] -mt-2">
            Describe what you're looking for. Tutors browsing the platform will
            be able to see and apply.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grade 10 Mathematics Tutor Needed"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what you need — subjects, schedule, expectations..."
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Subjects — Checkbox Grid */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">
              Subjects *{" "}
              <span className="text-[var(--text-faint)]">
                (select one or more)
              </span>
            </label>
            {selectedSubjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedSubjects.map((s) => (
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
              {ALL_SUBJECTS.map((s) => (
                <CheckboxButton
                  key={s}
                  label={s}
                  checked={selectedSubjects.includes(s)}
                  onClick={() => toggleSubject(s)}
                />
              ))}
            </div>
          </div>

          {/* Grades — Checkbox Grid */}
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-2">
              Grades *{" "}
              <span className="text-[var(--text-faint)]">
                (select one or more)
              </span>
            </label>
            {selectedGrades.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {selectedGrades.map((g) => (
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
              {ALL_GRADES.map((g) => (
                <CheckboxButton
                  key={g}
                  label={g}
                  checked={selectedGrades.includes(g)}
                  onClick={() => toggleGrade(g)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Addis Ababa"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Teaching Mode
              </label>
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={inputStyle}
              >
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Budget / Salary
              </label>
              <input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 3000-5000 ETB/month"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-[var(--text-primary)] focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={
              !title ||
              selectedSubjects.length === 0 ||
              selectedGrades.length === 0 ||
              submitting
            }
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {submitting ? "Posting..." : "Post Vacancy"}
          </button>
        </div>
      )}

      {/* Vacancy List */}
      <div className="space-y-4">
        {vacancies.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
            }}
          >
            <Briefcase
              size={32}
              className="mx-auto mb-3 text-[var(--text-faint)]"
            />
            <p className="text-sm text-[var(--text-secondary)]">
              No vacancies available yet. Post the first one!
            </p>
          </div>
        ) : (
          vacancies.map((vacancy, i) => {
            const modeStyle =
              MODE_COLORS[vacancy.teachingMode] ?? MODE_COLORS["in-person"];
            const isMine = myVacancyIds.has(vacancy.id);
            const isOpen = vacancy.status === "open";
            return (
              <div
                key={vacancy.id}
                className={`rounded-xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${isOpen ? "var(--border-color)" : "var(--border-color)"}`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-[var(--text-primary)]">
                        {vacancy.title}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{
                          background: modeStyle.bg,
                          color: modeStyle.color,
                        }}
                      >
                        {vacancy.teachingMode}
                      </span>
                      {isMine && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: "rgba(168,85,247,0.12)",
                            color: "var(--badge-purple-color)",
                          }}
                        >
                          Your Post
                        </span>
                      )}
                      {!isOpen && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: "rgba(107,114,128,0.12)",
                            color: "var(--text-muted)",
                          }}
                        >
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mb-2">
                      {vacancy.organizationName}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {vacancy.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* Subjects */}
                      {vacancy.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {vacancy.subjects.map((s) => (
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
                        </div>
                      )}
                      {/* Grades */}
                      {vacancy.grades.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <GraduationCap size={12} />{" "}
                          {vacancy.grades.join(", ")}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <MapPin size={12} /> {vacancy.location || "TBD"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <DollarSign size={12} /> {vacancy.salary}
                      </span>
                      {vacancy.deadline && (
                        <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Clock size={12} /> Deadline: {vacancy.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMine && (
                      <button
                        onClick={() => onBrowseApplicants?.(vacancy.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: "var(--accent-bg)",
                          color: "var(--accent)",
                          border: "1px solid var(--accent-border)",
                        }}
                      >
                        <Users size={13} /> Browse Applicants
                      </button>
                    )}
                    {isMine && isOpen && (
                      <button
                        onClick={() => handleClose(vacancy.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: "var(--danger-bg)",
                          color: "var(--danger-color)",
                          border: "1px solid var(--danger-bg)",
                        }}
                      >
                        <XCircle size={13} /> Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
