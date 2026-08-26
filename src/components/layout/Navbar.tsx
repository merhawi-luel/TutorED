import { useState } from "react";
import { NAV_LINKS } from "@/data/landing";

interface NavbarProps {
  onNavigate?: (view: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 h-16"
      style={{
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,197,94,0.1)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-black text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
        >
          E
        </div>
        <span className="text-white font-semibold text-lg tracking-tight">EduVerify</span>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-gray-400 hover:text-white transition-colors">
            {link}
          </a>
        ))}
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-3">
        <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2.5">
          Sign in
        </a>
        <a
          href="/register"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-black transition-all hover:opacity-90"
          style={{ background: "#22C55E" }}
        >
          Get Started
        </a>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden text-white p-2 -mr-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="absolute top-16 left-0 right-0 p-6 flex flex-col gap-4 md:hidden z-50"
          style={{ background: "rgba(0,0,0,0.98)", borderBottom: "1px solid rgba(34,197,94,0.1)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
              onClick={handleLinkClick}
            >
              {link}
            </a>
          ))}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
            <a href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2.5" onClick={handleLinkClick}>
              Sign in
            </a>
            <a
              href="/register"
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-black text-center"
              style={{ background: "#22C55E" }}
              onClick={handleLinkClick}
            >
              Get Started
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
