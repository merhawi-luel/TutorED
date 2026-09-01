import { useTheme } from "@/context/ThemeContext";

const FOOTER_COLUMNS = [
  { title: "Platform", links: ["For Tutors", "For Agencies", "For Parents", "Verification", "Pricing"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export default function Footer() {
  const { colors, isDark } = useTheme();

  return (
    <footer
      className="px-4 sm:px-6 md:px-12 py-24"
      style={{
        background: isDark ? "#000000" : colors.bgCard,
        borderTop: `1px solid ${colors.borderColor}`,
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: colors.logoGradient, color: isDark ? "#000" : "#fff" }}
            >
              E
            </div>
            <span className="font-semibold" style={{ color: colors.textPrimary }}>EduVerify</span>
          </div>
          <p className="text-xs max-w-xs" style={{ color: colors.textMuted }}>
            Verification and recruitment infrastructure for the education sector.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-8 sm:gap-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: colors.textSecondary }}>{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs transition-colors" style={{ color: colors.textMuted }}>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="max-w-6xl mx-auto mt-8 sm:mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: `1px solid ${colors.borderColor}` }}
      >
        <p className="text-xs" style={{ color: colors.textMuted }}>© 2026 EduVerify. All rights reserved.</p>
        <p className="text-xs" style={{ fontFamily: "DM Mono, monospace", color: colors.textMuted }}>
          Verify once. Apply anywhere.
        </p>
      </div>
    </footer>
  );
}