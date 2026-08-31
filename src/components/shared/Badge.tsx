import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

type BadgeVariant = "default" | "success" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const { colors } = useTheme();

  const styleMap: Record<BadgeVariant, React.CSSProperties> = {
    default: { background: colors.accentBg, border: `1px solid ${colors.accentBorder}`, color: colors.textSecondary },
    success: { background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" },
    danger: { background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, color: colors.dangerColor },
    info: { background: colors.accentBg, border: `1px solid ${colors.accentBorder}`, color: colors.accent },
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={styleMap[variant]}
    >
      {children}
    </span>
  );
}