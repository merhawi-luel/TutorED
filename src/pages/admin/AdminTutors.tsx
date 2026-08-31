import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import { Users, Search, CheckCircle2, Clock, AlertCircle, MapPin, Briefcase, Star } from "lucide-react";
import type { VerificationLevel } from "@/types";

const LEVEL_CONFIG: Record<VerificationLevel, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  verified: { color: "var(--accent)", label: "Verified", icon: CheckCircle2 },
  partial: { color: "var(--badge-pending-color)", label: "Partial", icon: Clock },
  unverified: { color: "var(--text-muted)", label: "Unverified", icon: AlertCircle },
  suspended: { color: "var(--danger-color)", label: "Suspended", icon: AlertCircle },
};

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "partial", label: "Partial" },
  { value: "unverified", label: "Unverified" },
];

export default function AdminTutors() {
  const { ref, inView } = useInView();
  const { colors } = useTheme();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [tutors, setTutors] = useState<any[]>([]);

  useEffect(() => { adminApi.getTutors().then(setTutors).catch(() => {}); }, []);

  const enriched = tutors.map((t: any) => {
    const profile = t.headline !== undefined ? {
      userId: t.id, headline: t.headline || "", subjects: t.subjects || [], experience: t.experience || 0,
      education: t.education || "", location: t.location || "", rating: parseFloat(t.rating) || 0,
      verificationLevel: t.verificationLevel || t.verification_level || "unverified",
    } : null;
    return { ...t, profile, docs: [] as any[] };
  });

  const filtered = enriched.filter((t) => {
    if (filter !== "all" && (t.profile?.verificationLevel ?? "unverified") !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) ||
        (t.profile?.headline ?? "").toLowerCase().includes(q) ||
        (t.profile?.subjects ?? []).some((s: string) => s.toLowerCase().includes(q));
    }
    return true;
  });

  const cs: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>Tutors</h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>All registered tutors and their verification status.</p>
      </div>

      <div className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`} style={cs}>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, headline, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: filter === f.value ? colors.accentBg : "transparent", border: `1px solid ${filter === f.value ? colors.accentBorder : colors.borderColor}`, color: filter === f.value ? colors.accent : colors.textMuted }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={cs}>
            <Users size={32} className="mx-auto mb-3" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>No tutors match this filter.</p>
          </div>
        ) : filtered.map((tutor, i) => {
          const level = (tutor.profile?.verificationLevel ?? "unverified") as keyof typeof LEVEL_CONFIG;
          const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.unverified;
          const LevelIcon = cfg.icon;
          const verifiedDocs = tutor.docs.filter((d: any) => d.status === "verified").length;
          return (
            <div key={tutor.id} className={`rounded-2xl p-5 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`} style={cs}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ background: colors.accent, color: "#fff" }}>
                    {tutor.name.split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{tutor.name}</span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${cfg.color}18`, color: cfg.color }}>
                        <LevelIcon size={11} /> {cfg.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{tutor.email}</div>
                    <div className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>{tutor.profile?.headline ?? "No headline"} · Joined {tutor.createdAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 text-xs shrink-0" style={{ color: colors.textMuted }}>
                  {tutor.profile && (<>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {tutor.profile.location}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> {tutor.profile.experience}y exp</span>
                    <span className="flex items-center gap-1"><Star size={12} /> {tutor.profile.rating}</span>
                  </>)}
                  <span className="flex items-center gap-1"><CheckCircle2 size={12} style={{ color: colors.accent }} /> {verifiedDocs}/{tutor.docs.length} docs</span>
                </div>
              </div>
              {tutor.profile && (
                <div className="flex flex-wrap gap-1.5 mt-3 ml-16">
                  {tutor.profile.subjects.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: colors.accentBg, color: colors.textMuted }}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}