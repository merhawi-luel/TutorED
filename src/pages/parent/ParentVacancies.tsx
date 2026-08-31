import { useState, useEffect } from "react";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
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
} from "lucide-react";

interface VacancyItem {
  id: string;
  title: string;
  organizationName: string;
  subject: string;
  grade: string;
  location: string;
  salary: string;
  deadline: string;
  teachingMode: string;
  description: string;
  parentId?: string;
  status: string;
}

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  "in-person": { bg: "rgba(34,197,94,0.12)", color: "#22C55E" },
  online: { bg: "rgba(59,130,246,0.12)", color: "#60A5FA" },
  hybrid: { bg: "rgba(168,85,247,0.12)", color: "#C084FC" },
};

export default function ParentVacancies() {
  const { ref, inView } = useInView();
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [myVacancyIds, setMyVacancyIds] = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
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
            subject: v.subject,
            grade: v.grade,
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

  const handleCreate = async () => {
    if (!title || !subject || !grade) return;
    setSubmitting(true);
    try {
      const created = await parentApi.createVacancy({
        title,
        description,
        subject,
        grade,
        location,
        teachingMode,
        salary,
        deadline,
      });
      const newVacancy: VacancyItem = {
        id: created.id,
        title: created.title,
        organizationName: created.parentName || "You",
        subject: created.subject,
        grade: created.grade,
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
      // Remove from local state (hard-delete)
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
    setSubject("");
    setGrade("");
    setLocation("");
    setTeachingMode("in-person");
    setSalary("");
    setDeadline("");
  };

  const inputStyle = {
    background: "#0D0D0D",
    border: "1px solid #1F1F1F",
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div
        className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}
      >
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Browse Vacancies
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Explore tutoring positions or post your own vacancy for tutors to
            find.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
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
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#4ADE80",
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
            background: "#111111",
            border: "1px solid rgba(34,197,94,0.3)",
          }}
        >
          <h2 className="text-sm font-medium text-gray-300">
            Post a Vacancy — Find a Tutor
          </h2>
          <p className="text-xs text-gray-500 -mt-2">
            Describe what you're looking for. Tutors browsing the platform will
            be able to see and apply.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grade 10 Mathematics Tutor Needed"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what you need — subjects, schedule, expectations..."
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none resize-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Subject *
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Grade *
              </label>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. Grade 10"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Location
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Addis Ababa"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Teaching Mode
              </label>
              <select
                value={teachingMode}
                onChange={(e) => setTeachingMode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              >
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Budget / Salary
              </label>
              <input
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 3000-5000 ETB/month"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!title || !subject || !grade || submitting}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: "#22C55E", color: "black" }}
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
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <Briefcase size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">
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
                  background: "#111111",
                  border: `1px solid ${isOpen ? "#1F1F1F" : "rgba(107,114,128,0.2)"}`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white">
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
                            color: "#C084FC",
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
                            color: "#6B7280",
                          }}
                        >
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {vacancy.organizationName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {vacancy.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <GraduationCap size={12} /> {vacancy.grade}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} /> {vacancy.location || "TBD"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <DollarSign size={12} /> {vacancy.salary}
                      </span>
                      {vacancy.deadline && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={12} /> Deadline: {vacancy.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isMine && isOpen && (
                      <button
                        onClick={() => handleClose(vacancy.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          color: "#F87171",
                          border: "1px solid rgba(239,68,68,0.2)",
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
