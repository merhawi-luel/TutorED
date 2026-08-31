import type { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "hero" | "standard" | "small" | "compact";

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  hero: "px-12 py-4 text-lg font-medium rounded-xl",
  standard: "px-6 py-3 text-base font-medium rounded-xl",
  small: "px-4 py-2 text-sm font-medium rounded-lg",
  compact: "px-2 py-1 text-xs rounded",
};

export default function Button({
  children,
  variant = "primary",
  size = "standard",
  href,
  onClick,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();

  const variantStyle = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return { background: colors.accent, color: "#fff" };
      case "secondary":
        return { border: `1px solid ${colors.accentBorder}`, color: colors.accent, background: "transparent" };
      case "ghost":
        return { color: colors.textMuted, background: "transparent" };
    }
  };

  const style: React.CSSProperties = {
    ...variantStyle(),
    ...(fullWidth ? { width: "100%" } : {}),
  };

  const base = "inline-flex items-center justify-center transition-all hover:opacity-90";
  const classes = `${base} ${SIZE_CLASSES[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes} style={style}>
      {children}
    </button>
  );
}