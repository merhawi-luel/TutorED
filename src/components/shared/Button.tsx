import type { ReactNode } from "react";

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

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-black hover:opacity-90",
  secondary: "border border-primary/30 text-primary hover:bg-primary/10",
  ghost: "text-gray-400 hover:text-white",
};

const SIZE_STYLES: Record<ButtonSize, string> = {
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
  const base = "inline-flex items-center justify-center transition-all";
  const width = fullWidth ? "w-full" : "";
  const styles = `${base} ${SIZE_STYLES[size]} ${VARIANT_STYLES[variant]} ${width} ${className}`;

  if (href) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
