import { VACANCIES_PREVIEW } from "@/data/landing";
import { useInView } from "@/hooks/useInView";

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  Featured: { bg: "rgba(34,197,94,0.15)", color: "#22C55E" },
  Urgent: { bg: "#FEE2E2", color: "#EF4444" },
  New: { bg: "rgba(34,197,94,0.15)", color: "#4ADE80" },
};

export default function VacanciesPreview() {
  const { ref: sectionRef, inView } = useInView();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 fade-up ${inView ? "in-view" : ""}`}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "#22C55E" }}>
              Open Roles
            </p>
            <h2 className="text-5xl md:text-7xl font-light leading-tight text-white" style={{ fontFamily: "Fraunces, serif" }}>
              Latest vacancies
            </h2>
          </div>
          <a href="/tutor" className="text-sm font-medium transition-colors" style={{ color: "#22C55E" }}>
            Browse all →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {VACANCIES_PREVIEW.map((v, i) => (
            <div
              key={v.title}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md gap-3 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
              style={{ border: "1px solid #1F1F1F", background: "#111111" }}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                  style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                >
                  {v.org[0]}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-medium text-white text-sm">{v.title}</span>
                    {v.tag && (
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium shrink-0"
                        style={
                          TAG_STYLES[v.tag]
                            ? { background: TAG_STYLES[v.tag].bg, color: TAG_STYLES[v.tag].color }
                            : { background: "#F1F5F9", color: "#64748B" }
                        }
                      >
                        {v.tag}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {v.org} · {v.location}
                  </div>
                </div>
              </div>
              <div className="text-right sm:shrink-0 pl-13 sm:pl-0">
                <div className="text-sm font-medium text-gray-300">{v.salary}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
