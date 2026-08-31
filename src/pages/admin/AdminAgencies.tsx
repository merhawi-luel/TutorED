import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import { Building2, Search, CheckCircle2, AlertCircle, MapPin, Briefcase, Users } from "lucide-react";

export default function AdminAgencies() {
  const { ref, inView } = useInView();
  const { colors } = useTheme();
  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => { adminApi.getAgencies().then(setOrganizations).catch(() => {}); }, []);

  const enriched = organizations.map((org: any) => ({
    ...org, description: org.description || "", location: org.location || "",
    subjects: org.subjects || [], isVerified: org.isVerified || org.is_verified || false,
    vacancyCount: 0, applicantCount: 0,
  }));

  const filtered = enriched.filter((org) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return org.name.toLowerCase().includes(q) || org.description.toLowerCase().includes(q) ||
      org.location.toLowerCase().includes(q) || org.subjects.some((s: string) => s.toLowerCase().includes(q));
  });

  const cs: React.CSSProperties = { background: colors.bgCard, border: `1px solid ${colors.borderColor}` };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>Agencies</h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>All registered agencies and organizations.</p>
      </div>

      <div className={`rounded-2xl p-5 fade-up delay-100 ${inView ? "in-view" : ""}`} style={cs}>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: colors.textMuted }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, description, location, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary }} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 rounded-xl p-12 text-center" style={cs}>
            <Building2 size={32} className="mx-auto mb-3" style={{ color: colors.textMuted }} />
            <p className="text-sm" style={{ color: colors.textSecondary }}>No agencies match this search.</p>
          </div>
        ) : filtered.map((org, i) => (
          <div key={org.id} className={`rounded-2xl p-6 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`} style={cs}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ background: colors.accent, color: "#fff" }}>{org.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: colors.textPrimary }}>{org.name}</span>
                    {org.isVerified ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: colors.accentBg, color: colors.accent }}>
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "var(--badge-pending-bg)", color: "var(--badge-pending-color)" }}>
                        <AlertCircle size={10} /> Unverified
                      </span>
                    )}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{org.description}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs mb-3" style={{ color: colors.textMuted }}>
              <span className="flex items-center gap-1"><MapPin size={12} /> {org.location}</span>
              <span className="flex items-center gap-1"><Briefcase size={12} /> {org.vacancyCount} vacancies</span>
              <span className="flex items-center gap-1"><Users size={12} /> {org.applicantCount} applicants</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {org.subjects.map((s: string) => (
                <span key={s} className="px-2 py-0.5 rounded text-xs" style={{ background: colors.accentBg, color: colors.textMuted }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}