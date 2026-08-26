import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "danger" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-white/5 border border-white/10 text-gray-300",
  success: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300",
  danger: "bg-red-500/20 border border-red-500/30 text-red-300",
  info: "bg-primary/20 border border-primary/30 text-emerald-300",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
