import { useTheme } from "@/context/ThemeContext";
import { PRICING } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { useInView } from "@/hooks/useInView";

export default function Pricing() {
  const { ref: sectionRef, inView } = useInView();
  const { colors, isDark } = useTheme();

  return (
    <section
      id="pricing"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader
            label="Pricing"
            title="Simple, transparent pricing"
            description="For agencies of every size."
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col relative fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
              style={
                plan.highlight
                  ? { background: colors.accentBg, border: `1px solid ${colors.accentBorder}` }
                  : { background: colors.bgCard, border: `1px solid ${colors.borderColor}` }
              }
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{ background: colors.accent, color: "#fff" }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold text-base mb-1" style={{ color: colors.textPrimary }}>{plan.name}</h3>
                <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: colors.textPrimary }}>{plan.price}</span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-base" style={{ color: colors.textSecondary }}>
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs"
                      style={{ background: colors.accent, color: "#fff" }}
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="/register"
                className="w-full py-3.5 rounded-xl text-base font-medium transition-all hover:opacity-90 text-center block"
                style={
                  plan.highlight
                    ? { background: colors.accent, color: "#fff" }
                    : { background: colors.bgInput, color: colors.textPrimary, border: `1px solid ${colors.borderColor}` }
                }
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}