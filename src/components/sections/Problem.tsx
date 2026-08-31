import { useTheme } from "@/context/ThemeContext";
import { PROBLEMS } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { FolderX, SearchX, ShieldQuestion } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const PROBLEM_ICONS = [FolderX, SearchX, ShieldQuestion];

export default function Problem() {
  const { ref: sectionRef, inView } = useInView();
  const { colors, isDark } = useTheme();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: isDark ? "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader
            label="The Problem"
            title="Education recruitment is broken"
            description="Vacancies spread across Telegram groups. Credentials verified manually every time. Trust is impossible to scale."
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
                style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}` }}
                >
                  <Icon size={24} color={colors.dangerColor} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-lg mb-4" style={{ color: colors.textPrimary }}>For {p.role}</h3>
                <ul className="space-y-3">
                  {p.pain.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                      <span
                        className="mt-1 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: colors.dangerBg, color: colors.dangerColor }}
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