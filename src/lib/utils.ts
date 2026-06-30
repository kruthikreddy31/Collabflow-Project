import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  LOW: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  MEDIUM: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  HIGH: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  URGENT: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
  VIEWER: "Viewer",
};

export function formatDueDate(date: Date | string | null | undefined) {
  if (!date) return null;
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isOverdue(date: Date | string | null | undefined) {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
];

export function colorForString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const DEFAULT_COLUMNS = ["To Do", "In Progress", "In Review", "Done"];
