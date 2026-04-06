import { cn } from "../../lib/utils";

const COLORS = [
  "bg-[#800020]",
  "bg-[#1a6b5a]",
  "bg-[#1a4d80]",
  "bg-[#6b1a6b]",
  "bg-[#7a5c00]",
  "bg-[#4a1a1a]",
];

function hashColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % COLORS.length;
  return COLORS[h] ?? COLORS[0]!;
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center text-white font-semibold uppercase",
        sizes[size],
        hashColor(name),
        className
      )}
    >
      {name.slice(0, 1)}
    </div>
  );
}
