import React, { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}

// Shared heading so every home-page section has the same size and spacing
export default function SectionHeading({
  children,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`text-center mb-8 lg:mb-14 ${className}`}>
      <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-black dark:text-white">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm lg:text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-[#4DB6AC]" />
    </div>
  );
}
