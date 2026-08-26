import { PROBLEMS } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";

export default function Problem() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12" style={{ background: "#0A0A0A" }}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          label="The Problem"
          title="Education recruitment is broken"
          description="Vacancies spread across Telegram groups. Credentials verified manually every time. Trust is impossible to scale."
        />

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {PROBLEMS.map((p) => (
            <div
              key={p.role}
              className="rounded-2xl p-8"
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-white text-lg mb-4">For {p.role}</h3>
              <ul className="space-y-3">
                {p.pain.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-gray-400">
                    <span
                      className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-xs"
                      style={{ background: "#FEE2E2", color: "#EF4444" }}
                    >
                      ✕
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
