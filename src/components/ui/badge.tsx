import { cn, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "solid";
  color?: string;
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "outline" && "border border-slate-200 text-slate-600",
        variant === "solid" && "bg-primary-600 text-white",
        className
      )}
    >
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const c = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        c.bg,
        c.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export function LabelBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
      {label}
    </span>
  );
}
