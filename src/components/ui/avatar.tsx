import Image from "next/image";
import { cn, getInitials, colorForString } from "@/lib/utils";

interface AvatarProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES: Record<string, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({ name, email, image, size = "md", className }: AvatarProps) {
  const initials = getInitials(name, email);
  const colorClass = colorForString(name || email || "?");

  if (image) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full ring-2 ring-white",
          SIZES[size],
          className
        )}
      >
        <Image src={image} alt={name || "avatar"} fill sizes="40px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      title={name || email || undefined}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white",
        SIZES[size],
        colorClass,
        className
      )}
    >
      {initials}
    </div>
  );
}
