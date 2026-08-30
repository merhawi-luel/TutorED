import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Building2,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  Users,
} from "lucide-react";

export default function AdminAgencies() {
  const { ref, inView } = useInView();
  const [search, setSearch] = useState("");
  const [organizations, setOrganizations] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getAgencies().then(setOrganizations).catch(() => {});
  }, []);

  const enriched = organizations.map((org: any) => ({
    ...org,
    description: org.description || "",
    location: org.location || "",
    subjects: org.subjects || [],
    isVerified: org.isVerified || org.is_verified || false,
    vacancyCount: 0,
    applicantCount: 0,
  }));

  const filtered = enriched.filter((org) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        org.name.toLowerCase().includes(q) ||
        org.description.toLowerCase().includes(q) ||
        org.location.toLowerCase().includes(q) ||
        org.subjects.some((s: string) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Agencies</h1>
        <p className="text-sm text-gray-400 mt-1">All registered agencies and organizations.</p>
      </div>

      {/* Search */}
      <div
        className={`rounded-2xl p-5 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, description, location, or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
          />
        </div>
      </div>

      {/* Agency Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 rounded-xl p-12 text-center" style={{ background: "#111111", border: "1px solid #1F1F1F" }}>
            <Building2 size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No agencies match this search.</p>
          </div>
        ) : (
          filtered.map((org, i) => (
            <div
              key={org.id}
              className={`rounded-2xl p-6 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                  >
                    {org.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{org.name}</span>
                      {org.isVerified ? (
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
                        >
                          <CheckCircle2 size={10} /> Verified
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                        >
                          <AlertCircle size={10} /> Unverified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{org.description}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {org.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} /> {org.vacancyCount} vacancies
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {org.applicantCount} applicants
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {org.subjects.map((s: string) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded text-xs"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
