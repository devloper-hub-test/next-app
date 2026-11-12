"use client";

import { useCustomizer } from "./CustomizerProvider";
import type { TextId } from "./schema";

interface CustomTextProps {
  id: TextId;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4";
  className?: string;
  /** Part of the section it styles as: "heading", "text", "accent", "accent-bg" (space-separated) */
  role?: string;
}

/** Text that can be changed from the /customize dashboard. Always rendered as plain text. */
export function CustomText({ id, as: Tag = "span", className, role }: CustomTextProps) {
  const { text } = useCustomizer();
  return (
    <Tag className={className} data-role={role}>
      {text(id)}
    </Tag>
  );
}
