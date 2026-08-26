import { PROBLEMS } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { FolderX, SearchX, ShieldQuestion } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const PROBLEM_ICONS = [FolderX, SearchX, ShieldQuestion];

export default function Problem() {
  const { ref: sectionRef, inView } = useInView();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader
            label="The Problem"
            title="Education recruitment is broken"
            description="Vacancies spread across Telegram groups. Credentials verified manually every time. Trust is impossible to scale."
            dark
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {PROBLEMS.map((p, i) => {
            const Icon = PROBLEM_ICONS[i];
            const delay = `delay-${i * 100}`;
            const floatClass = `problem-card-${i + 1}`;
            return (
              <div
                key={p.role}
                className={`rounded-2xl p-8 slide-right ${delay} ${floatClass} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(13, 193, 100, 0.64)", border: "1px solid rgba(239,68,68,0.18)" }}
                >
                  <Icon size={24} color="#EF4444" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-white text-lg mb-4">For {p.role}</h3>
                <ul className="space-y-3">
                  {p.pain.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-gray-400">
                      <span
                        className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: "rgba(235, 234, 234, 0.99)", color: "#ff0000" }}
                      >
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
