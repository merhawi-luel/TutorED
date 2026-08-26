import { PRICING } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";

export default function Pricing() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12" style={{ background: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="Pricing"
          title="Simple, transparent pricing"
          description="For agencies of every size."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl p-8 flex flex-col relative"
              style={
                plan.highlight
                  ? { background: "#0D2016", color: "white", border: "1px solid rgba(34,197,94,0.3)" }
                  : { background: "#111111", border: "1px solid #1F1F1F" }
              }
            >
              {plan.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium text-black whitespace-nowrap"
                  style={{ background: "#22C55E" }}
                >
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-semibold text-base mb-1 ${plan.highlight ? "text-white" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-3 ${plan.highlight ? "text-gray-400" : "text-gray-400"}`}>
                  {plan.desc}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-bold ${plan.highlight ? "text-white" : "text-white"}`}>
                    {plan.price}
                  </span>
                  <span className="text-xs text-gray-400">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-3 text-base ${plan.highlight ? "text-gray-300" : "text-gray-400"}`}>
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs"
                      style={{ background: "#22C55E", color: "black" }}
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
                    ? { background: "#22C55E", color: "black" }
                    : { background: "#161616", color: "white", border: "1px solid #1F1F1F" }
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
