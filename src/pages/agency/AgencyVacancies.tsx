import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import {
  Plus,
  Briefcase,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import type { TeachingMode } from "@/types";

export default function AgencyVacancies() {
  const { getAgencyVacancies, createVacancy, closeVacancy, getVacancyApplicants } = useData();
  const { ref, inView } = useInView();

  const [showCreate, setShowCreate] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [requiredExperience, setRequiredExperience] = useState(0);
  const [location, setLocation] = useState("Addis Ababa");
  const [teachingMode, setTeachingMode] = useState<TeachingMode>("in-person");
  const [salary, setSalary] = useState("");
  const [availability, setAvailability] = useState("");
  const [deadline, setDeadline] = useState("");

  const myVacancies = getAgencyVacancies();

  const handleCreate = () => {
    if (!title || !subject || !grade) return;
    createVacancy({
      title, description, subject, grade, requiredEducation, requiredExperience,
      location, teachingMode, salary, availability, deadline,
    });
    resetForm();
    setShowCreate(false);
    setSuccessMsg("Vacancy created successfully!");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleClose = (vacancyId: string) => {
    closeVacancy(vacancyId);
    setSuccessMsg("Vacancy closed.");
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setSubject(""); setGrade("");
    setRequiredEducation(""); setRequiredExperience(0); setLocation("Addis Ababa");
    setTeachingMode("in-person"); setSalary(""); setAvailability(""); setDeadline("");
  };

  const inputStyle = { background: "#0D0D0D", border: "1px solid #1F1F1F" };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`flex items-center justify-between fade-up ${inView ? "in-view" : ""}`}>
        <div>
          <h1 className="text-2xl font-semibold text-white">Vacancies</h1>
          <p className="text-sm text-gray-400 mt-1">Create and manage your job postings.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: "#22C55E", color: "black" }}
        >
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? "Cancel" : "New Vacancy"}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div
          className="rounded-xl px-5 py-3 flex items-center gap-3 text-sm"
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ADE80" }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div
          className={`rounded-2xl p-6 space-y-4 fade-up ${inView ? "in-view" : ""}`}
          style={{ background: "#111111", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <h2 className="text-sm font-medium text-gray-300">Create New Vacancy</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grade 12 Mathematics Tutor" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the role, requirements, and what you're looking for..." className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none resize-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Subject *</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Grade *</label>
              <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. Grade 12" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Required Education</label>
              <input value={requiredEducation} onChange={(e) => setRequiredEducation(e.target.value)} placeholder="e.g. Bachelor's degree" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Experience (years)</label>
              <input type="number" min={0} value={requiredExperience} onChange={(e) => setRequiredExperience(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Teaching Mode</label>
              <select value={teachingMode} onChange={(e) => setTeachingMode(e.target.value as TeachingMode)} className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle}>
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Salary</label>
              <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $400–$600/mo" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Availability</label>
              <input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="e.g. Weekends" className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Application Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full px-4 py-2.5 rounded-xl text-sm text-white focus:outline-none" style={inputStyle} />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={!title || !subject || !grade}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: "#22C55E", color: "black" }}
          >
            Create Vacancy
          </button>
        </div>
      )}

      {/* Vacancy List */}
      <div className="space-y-3">
        {myVacancies.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <Briefcase size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No vacancies yet. Create your first one!</p>
          </div>
        ) : (
          myVacancies.map((vacancy, i) => {
            const applicants = getVacancyApplicants(vacancy.id);
            const isOpen = vacancy.status === "open";
            return (
              <div
                key={vacancy.id}
                className={`rounded-2xl p-5 transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: `1px solid ${isOpen ? "#1F1F1F" : "rgba(107,114,128,0.2)"}` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{vacancy.title}</h3>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                        style={{
                          background: isOpen ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                          color: isOpen ? "#22C55E" : "#6B7280",
                        }}
                      >
                        {vacancy.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2 line-clamp-1">{vacancy.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase size={11} /> {vacancy.subject} · {vacancy.grade}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {vacancy.location}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {vacancy.teachingMode}</span>
                      <span className="flex items-center gap-1"><Users size={11} /> {applicants.length} applicants</span>
                      <span className="text-gray-600">Deadline: {vacancy.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOpen && (
                      <button
                        onClick={() => handleClose(vacancy.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
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
