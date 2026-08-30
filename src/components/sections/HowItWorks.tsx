import { HOW_IT_WORKS } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { useInView } from "@/hooks/useInView";

export default function HowItWorks() {
  const { ref: sectionRef, inView } = useInView();

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader
            label="How it Works"
            title="One identity. Every opportunity."
            dark
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px opacity-20"
            style={{ background: "linear-gradient(to right, transparent, #22C55E, transparent)" }}
          />

          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.step}
              className={`relative fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
            >
              <div
                className="rounded-2xl p-8 h-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span
                    className="text-3xl sm:text-4xl font-light"
                    style={{ fontFamily: "DM Mono, monospace", color: "rgba(255,255,255,0.15)" }}
                  >
                    {step.step}
                  </span>
                  <span className="text-xl sm:text-2xl" style={{ color: "#4ADE80" }}>
                    {step.icon}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verification flow visual */}
        <div
          className={`mt-12 sm:mt-16 rounded-2xl p-6 md:p-8 flex flex-wrap items-center justify-center gap-3 text-center fade-up delay-400 ${inView ? "in-view" : ""}`}
          style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          {["Tutor Registration", "→", "Create Profile", "→", "Upload Docs", "→", "Verification Queue", "→", "✓ Verified Badge"].map(
            (item, i) => (
              <span
                key={i}
                className={
                  item === "→"
                    ? "text-gray-600 text-lg hidden sm:inline"
                    : item.startsWith("✓")
                    ? "px-3 py-1.5 rounded-lg font-medium text-xs"
                    : "px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                }
                style={
                  item === "→"
                    ? {}
                    : item.startsWith("✓")
                    ? { background: "#22C55E", color: "black" }
                    : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
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
