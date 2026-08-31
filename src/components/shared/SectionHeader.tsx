import { useTheme } from "@/context/ThemeContext";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export default function SectionHeader({ label, title, description }: SectionHeaderProps) {
  const { colors } = useTheme();

  return (
    <div className="text-center mb-16">
      <p
        className="text-xs font-medium uppercase tracking-wider mb-3"
        style={{ color: colors.accent }}
      >
        {label}
      </p>
      <h2
        className="text-5xl md:text-7xl font-light leading-tight mb-4"
        style={{ fontFamily: "Fraunces, serif", color: colors.textPrimary }}
      >
        {title}
      </h2>
      {description && (
        <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: colors.textSecondary }}>
          {description}
        </p>
      )}
    </div>
  );
}