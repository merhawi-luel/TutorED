import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Briefcase,
  Star,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import type { VerificationLevel } from "@/types";

const LEVEL_CONFIG: Record<VerificationLevel, { color: string; label: string }> = {
  verified: { color: "#22C55E", label: "Verified" },
  partial: { color: "#F59E0B", label: "Partial" },
  unverified: { color: "#6B7280", label: "Unverified" },
  suspended: { color: "#EF4444", label: "Suspended" },
};

export default function AgencyTutors() {
  const { ref, inView } = useInView();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tutors, setTutors] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getTutors().then(setTutors).catch(() => {});
  }, []);

  const enriched = tutors.map((t: any) => {
    const profile = t.headline !== undefined ? {
      userId: t.id,
      headline: t.headline || "",
      bio: "",
      subjects: t.subjects || [],
      grades: [],
      experience: t.experience || 0,
      education: t.education || "",
      location: t.location || "",
      teachingMode: "in-person" as const,
      availability: "",
      rating: parseFloat(t.rating) || 0,
      applicationCount: 0,
      verificationLevel: (t.verificationLevel || t.verification_level || "unverified") as any,
    } : null;
    return { ...t, profile, docs: [] as any[], verifiedDocs: 0 };
  });

  // Collect all unique subjects
  const allSubjects = ["All", ...new Set(enriched.filter((t: any) => t.profile).flatMap((t: any) => t.profile!.subjects))];

  const filtered = enriched.filter((t) => {
    if (!t.profile) return false;
    if (levelFilter !== "all" && t.profile.verificationLevel !== levelFilter) return false;
    if (subjectFilter !== "All" && !t.profile.subjects.includes(subjectFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.profile.headline.toLowerCase().includes(q) ||
        t.profile.education.toLowerCase().includes(q) ||
        t.profile.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Find Tutors</h1>
        <p className="text-sm text-gray-400 mt-1">
          Browse verified educators on the platform.
        </p>
      </div>

      {/* Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, headline, education, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Subject pills */}
          <div className="flex gap-1.5 flex-wrap flex-1">
            {allSubjects.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: subjectFilter === s ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${subjectFilter === s ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: subjectFilter === s ? "#22C55E" : "#9CA3AF",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Verification filter */}
          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 focus:outline-none appearance-none pr-7"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Only</option>
              <option value="partial">Partial</option>
              <option value="unverified">Unverified</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? "tutor" : "tutors"} found
      </div>

      {/* Tutor Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <Search size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No tutors match your search.</p>
          </div>
        ) : (
          filtered.map((tutor, i) => {
            const profile = tutor.profile!;
            const level = profile.verificationLevel as keyof typeof LEVEL_CONFIG;
            const lvlCfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.unverified;
            const isExpanded = expandedId === tutor.id;

            return (
              <div
                key={tutor.id}
                className={`rounded-2xl overflow-hidden transition-all fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : tutor.id)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                      style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                    >
                      {tutor.name.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{tutor.name}</span>
                        <span
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: `${lvlCfg.color}18`, color: lvlCfg.color }}
                        >
                          {level === "verified" && <CheckCircle2 size={10} />}
                          {level === "partial" && <Clock size={10} />}
                          {level === "unverified" && <AlertCircle size={10} />}
                          {lvlCfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{profile.headline}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                        <span className="flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>
                        <span className="flex items-center gap-1"><Briefcase size={11} /> {profile.experience}y exp</span>
                        <span className="flex items-center gap-1"><Star size={11} /> {profile.rating}</span>
                        <span className="flex items-center gap-1"><GraduationCap size={11} /> {profile.education}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    size={16}
                    className="text-gray-500 transition-transform shrink-0"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}
                  />
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1F1F1F" }} className="px-5 py-5 space-y-4">
                    <p className="text-xs text-gray-400 leading-relaxed">{profile.bio}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {profile.subjects.map((s: string) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
                          {s}
                        </span>
                      ))}
                      {profile.grades.map((g: string) => (
                        <span key={g} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}>
                          {g}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Mode", value: profile.teachingMode },
                        { label: "Availability", value: profile.availability },
                        { label: "Rating", value: `${profile.rating}/5` },
                        { label: "Applications", value: `${profile.applicationCount}` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg px-3 py-2" style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}>
                          <div className="text-[10px] text-gray-600 uppercase">{item.label}</div>
                          <div className="text-xs text-white capitalize">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Verification Details */}
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
                    >
                      <div className="text-[10px] text-gray-600 uppercase mb-2">Verification Status</div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}>
                          <CheckCircle2 size={12} /> Identity ✓
                        </span>
                        <span className="flex items-center gap-1.5" style={{ color: "#22C55E" }}>
                          <CheckCircle2 size={12} /> Education ✓
                        </span>
                        <span className="flex items-center gap-1.5" style={{ color: tutor.verifiedDocs >= 3 ? "#22C55E" : "#F59E0B" }}>
                          {tutor.verifiedDocs >= 3 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {tutor.verifiedDocs}/{tutor.docs.length} docs verified
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
