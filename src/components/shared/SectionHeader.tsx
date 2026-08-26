interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  dark?: boolean;
}

export default function SectionHeader({ label, title, description, dark = false }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <p
        className="text-xs font-medium uppercase tracking-wider mb-3"
        style={{ color: dark ? "#4ADE80" : "#22C55E" }}
      >
        {label}
      </p>
      <h2
        className={`text-5xl md:text-7xl font-light leading-tight mb-4 ${dark ? "text-white" : "text-slate-900"}`}
        style={{ fontFamily: "Fraunces, serif" }}
      >
        {title}
      </h2>
      {description && (
        <p className={`text-sm leading-relaxed max-w-xl mx-auto ${dark ? "text-gray-400" : "text-gray-500"}`}>
          {description}
        </p>
      )}
    </div>
  );
}
