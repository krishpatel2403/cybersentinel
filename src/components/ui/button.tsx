import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-cyan-400 text-slate-950 shadow-[0_0_24px_-6px_rgba(34,211,238,0.55)] hover:bg-cyan-300",
  secondary:
    "border border-white/10 bg-white/[0.04] text-slate-100 hover:border-white/20 hover:bg-white/[0.08]",
  ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:border-rose-500/50 hover:bg-rose-500/20",
  subtle:
    "border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:border-cyan-400/40 hover:bg-cyan-400/15",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  icon: "size-9 p-0",
};

export function buttonClasses(
  variant: Variant = "secondary",
  size: Size = "md",
  className?: string,
) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "secondary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
