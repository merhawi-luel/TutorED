const FOOTER_COLUMNS = [
  { title: "Platform", links: ["For Tutors", "For Agencies", "Verification", "Pricing"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security"] },
];

export default function Footer() {
  return (
    <footer
      className="px-4 sm:px-6 md:px-12 py-24"
      style={{ background: "#000000", borderTop: "1px solid rgba(34,197,94,0.1)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-black text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
            >
              E
            </div>
            <span className="text-white font-semibold">EduVerify</span>
          </div>
          <p className="text-gray-500 text-xs max-w-xs">
            Verification and recruitment infrastructure for the education sector.
          </p>
        </div>

        {/* Link Columns */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-8 sm:gap-12">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-gray-300 text-xs font-medium uppercase tracking-wider mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-500 text-xs hover:text-gray-300 transition-colors">
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
        style={{ borderTop: "1px solid rgba(34,197,94,0.1)" }}
      >
        <p className="text-gray-600 text-xs">© 2026 EduVerify. All rights reserved.</p>
        <p className="text-gray-600 text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
          Verify once. Apply anywhere.
        </p>
      </div>
    </footer>
  );
}
