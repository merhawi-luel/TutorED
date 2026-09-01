import { useTheme } from "@/context/ThemeContext";
import { HOW_IT_WORKS } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { useInView } from "@/hooks/useInView";

export default function HowItWorks() {
  const { ref: sectionRef, inView } = useInView();
  const { colors, isDark } = useTheme();

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader
            label="How it Works"
            title="One identity. Every opportunity."
          />
        </div>

        <div className="grid md:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px opacity-20"
            style={{ background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)` }}
          />

          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className={`relative fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
            >
              <div
                className="rounded-2xl p-8 h-full"
                style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-3xl sm:text-4xl font-light"
                    style={{ fontFamily: "DM Mono, monospace", color: colors.textFaint }}
                  >
                    {step.step}
                  </span>
                  <span className="text-xl sm:text-2xl">{step.icon}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: colors.textPrimary }}>{step.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verification flow visual */}
        <div
          className={`mt-12 sm:mt-16 rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-center gap-3 text-center fade-up delay-400 ${inView ? "in-view" : ""}`}
          style={{ background: colors.accentBg, border: `1px solid ${colors.accentBorder}` }}
        >
          {["Tutor Registration", "→", "Create Profile", "→", "Upload Docs", "→", "Verification Queue", "→", "✓ Verified Badge", "→", "Get Hired", "→", "★ Reviews"].map(
            (item, i) => (
              <span
                key={i}
                className={
                  item === "→"
                    ? "text-lg hidden sm:inline"
                    : item.startsWith("✓")
                    ? "px-3 py-1.5 rounded-lg font-medium text-xs"
                    : "px-3 py-1.5 rounded-lg text-xs font-medium"
                }
                style={
                  item === "→"
                    ? { color: colors.textFaint }
                    : item.startsWith("✓")
                    ? { background: colors.accent, color: "#fff" }
                    : { background: colors.bgCard, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary }
                }
              >
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}