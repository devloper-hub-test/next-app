import React, { ReactNode } from "react";
import { CustomText } from "../../customizer/CustomText";
import type { TextId } from "../../customizer/schema";

interface SectionHeadingProps {
  children?: ReactNode;
  subtitle?: string;
  className?: string;
  /** Customizable heading / subtitle text (used instead of children / subtitle) */
  textId?: TextId;
  subtitleId?: TextId;
}

// Shared heading so every home-page section has the same size and spacing
export default function SectionHeading({
  children,
  subtitle,
  className = "",
  textId,
  subtitleId,
}: SectionHeadingProps) {
  const headingClass = "text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-black dark:text-white";
  const subtitleClass = "mt-3 text-sm lg:text-base text-gray-600 dark:text-gray-400";
  return (
    <div className={`text-center mb-8 lg:mb-14 ${className}`}>
      {textId ? (
        <CustomText as="h2" className={headingClass} id={textId} role="heading" />
      ) : (
        <h2 className={headingClass} data-role="heading">
          {children}
        </h2>
      )}
      {subtitleId ? (
        <CustomText as="p" className={subtitleClass} id={subtitleId} role="text" />
      ) : (
        subtitle && (
          <p className={subtitleClass} data-role="text">
            {subtitle}
          </p>
        )
      )}
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand" data-role="accent-bg" />
    </div>
  );
}
