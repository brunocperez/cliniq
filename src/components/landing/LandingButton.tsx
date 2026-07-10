import Link from "next/link";
import { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cliniq-400";

const variants: Record<Variant, string> = {
  primary: "bg-cliniq-600 text-white hover:bg-cliniq-700 border border-cliniq-600",
  secondary: "bg-[var(--surface-card)] text-[var(--text-body)] border border-[var(--border-default)] hover:bg-[var(--surface-app)]",
  ghost: "bg-transparent text-[var(--text-muted)] border border-transparent hover:bg-[var(--surface-sunken)] hover:text-[var(--text-body)]",
  danger: "bg-[var(--surface-card)] text-red-600 border border-red-200 hover:bg-red-50",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

type Props = {
  variant?: Variant;
  size?: Size;
  className?: string;
} & ComponentProps<typeof Link>;

export function LandingButton({ variant = "primary", size = "md", className = "", ...props }: Props) {
  return (
    <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}