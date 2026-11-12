/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

// Teal-leaning palettes so placeholder covers match the site accent
const GRADIENTS = [
  "from-brand to-[#3b82f6]",
  "from-[#0f766e] to-brand",
  "from-[#6366f1] to-brand",
  "from-[#0ea5e9] to-[#14b8a6]",
  "from-brand to-[#a855f7]",
];

// Same title always gets the same gradient
function pickGradient(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

interface PostCoverProps {
  title: string;
  cover?: string;
  className?: string;
}

export function PostCover({ title, cover, className }: PostCoverProps) {
  if (cover) {
    return (
      <img
        src={cover}
        alt={title}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br p-5",
        pickGradient(title),
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
      <span className="absolute -right-4 -top-10 select-none font-mono text-[9rem] font-bold leading-none text-white/15">
        {title.charAt(0).toUpperCase()}
      </span>
      <span className="relative line-clamp-2 font-semibold text-white/90 drop-shadow-sm">
        {title}
      </span>
    </div>
  );
}
