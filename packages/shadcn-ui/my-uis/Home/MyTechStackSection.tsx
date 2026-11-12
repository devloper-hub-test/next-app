"use client";
import { AnimatedBeam } from "../../components/ui/animated-beam";
import React, { forwardRef, ReactNode, RefObject, createRef, useRef } from "react";
import ReactIcon from "../../Icons/ReactIcon";
import AndroidIcon from "../../Icons/AndroidIcon";
import SectionHeading from "./SectionHeading";
import { CustomText } from "../../customizer/CustomText";
import BrandIcon from "./BrandIcon";

interface Node {
  name: string;
  icon: ReactNode;
}

// Tools that feed into React Native on the left, platforms it ships to on the right
const TOOLS: Node[] = [
  { name: "TypeScript", icon: <BrandIcon slug="typescript" name="TypeScript" /> },
  { name: "Expo", icon: <BrandIcon slug="expo" name="Expo" /> },
  { name: "Redux", icon: <BrandIcon slug="redux" name="Redux" /> },
  { name: "Firebase", icon: <BrandIcon slug="firebase" name="Firebase" /> },
];

const PLATFORMS: Node[] = [
  { name: "Android", icon: <AndroidIcon /> },
  { name: "iOS", icon: <BrandIcon slug="apple" name="iOS" /> },
];

const BEAM_COLORS = {
  gradientStartColor: "#4DB6AC", // SVG attribute: CSS variables are not supported here
  gradientStopColor: "#3b82f6",
  pathOpacity: 0.15,
};

const useNodeRefs = (nodes: Node[]) =>
  useRef(nodes.map(() => createRef<HTMLDivElement>())).current;

export default function MyTechStackSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const toolRefs = useNodeRefs(TOOLS);
  const platformRefs = useNodeRefs(PLATFORMS);

  return (
    <div className="rounded-3xl bg-gray-50 px-4 py-10 dark:bg-gray-900 lg:px-12 lg:py-16" data-section="mobile">
      <SectionHeading textId="mobile.heading" />
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <CustomText
          as="p"
          className="order-2 block text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300 lg:order-1 lg:pr-16 lg:text-left lg:text-lg lg:leading-8"
          id="mobile.body"
          role="text"
        />
        <div
          ref={containerRef}
          className="relative order-1 mx-auto flex h-[280px] w-full max-w-lg items-center justify-between overflow-hidden px-2 lg:order-2 lg:h-[340px] lg:px-6"
        >
          <div className="flex h-full flex-col justify-between py-2">
            {TOOLS.map((tool, i) => (
              <Circle key={tool.name} ref={toolRefs[i]} label={tool.name}>
                {tool.icon}
              </Circle>
            ))}
          </div>

          <div
            ref={hubRef}
            className="z-10 flex flex-col items-center justify-center gap-1 rounded-3xl border border-brand/40 bg-white px-4 py-4 shadow-[0_0_32px_hsl(var(--brand)/0.35)] dark:bg-neutral-950 lg:px-5 lg:py-5"
          >
            <div className="size-10 lg:size-12 [&>*]:size-full">
              <ReactIcon />
            </div>
            <span className="whitespace-nowrap text-[10px] font-semibold text-gray-700 dark:text-gray-200 lg:text-xs">
              React Native
            </span>
          </div>

          <div className="flex h-full flex-col justify-center gap-16 lg:gap-20">
            {PLATFORMS.map((platform, i) => (
              <Circle
                key={platform.name}
                ref={platformRefs[i]}
                label={platform.name}
                className="size-14 lg:size-16"
              >
                {platform.icon}
              </Circle>
            ))}
          </div>

          {toolRefs.map((ref, i) => (
            <AnimatedBeam
              key={TOOLS[i].name}
              containerRef={containerRef}
              fromRef={ref}
              toRef={hubRef}
              delay={i * 0.4}
              {...BEAM_COLORS}
            />
          ))}
          {platformRefs.map((ref, i) => (
            <AnimatedBeam
              key={PLATFORMS[i].name}
              containerRef={containerRef}
              fromRef={hubRef}
              toRef={ref}
              curvature={i === 0 ? 40 : -40}
              delay={1 + i * 0.4}
              {...BEAM_COLORS}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CircleProps {
  children?: ReactNode;
  className?: string;
  label: string;
}

const Circle = forwardRef<HTMLDivElement, CircleProps>(
  ({ children, className = "size-11 lg:size-12", label }, ref) => {
    return (
      <div className="group relative z-10 flex flex-col items-center">
        <div
          ref={ref as RefObject<HTMLDivElement>}
          title={label}
          className={`flex items-center justify-center rounded-full border border-gray-200 bg-white p-2.5 shadow-md transition-transform duration-200 group-hover:scale-110 dark:border-white/10 dark:shadow-black/50 [&>*]:size-full ${className}`}
        >
          {children}
        </div>
        <span className="pointer-events-none absolute -bottom-5 whitespace-nowrap text-[10px] font-medium text-gray-500 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-400">
          {label}
        </span>
      </div>
    );
  }
);
Circle.displayName = "Circle";
