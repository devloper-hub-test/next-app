"use client";
import NotionIcon from "../../Icons/NotionIcon";
import MySQLIcon from "../../Icons/MySQLIcon";
import { AnimatedBeam } from "../../components/ui/animated-beam";
import React, { forwardRef, useRef } from "react";
import NodeJsIcon from "../../Icons/NodeJsIcon";
import ReactIcon from "../../Icons/ReactIcon";
import GitHubIcon from "../../Icons/GitHubIcon";
import AWSIcon from "../../Icons/AWSIcon";
import AndroidIcon from "../../Icons/AndroidIcon";

export default function MyTechStackSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);
  return (
    <div className="">
      <h4 className="text-center text-5xl">
        Crafting Android & iOS Experiences
      </h4>
      <div className="grid grid-cols-2 mt-14 ">
        <div className="pr-24 text-lg leading-8 tracking-wide capitalize break-word">
          {`As a developer proficient in React Native, I craft intuitive Android
          and iOS applications that deliver top-notch performance and user
          satisfaction. From ideation to deployment, I specialize in building
          cross-platform solutions with clean code, responsive designs, and a
          focus on usability. Let's shape the future of mobile experiences
          together!`}
        </div>
        <div
          className="relative flex w-full items-center justify-center overflow-hidden rounded-lg bg-background p-10"
          ref={containerRef}
        >
          <div className="flex size-full flex-col max-w-lg max-h-[200px] items-stretch justify-between gap-10">
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div1Ref}>
                <MySQLIcon />
              </Circle>
              <Circle ref={div5Ref}>
                <NotionIcon />
              </Circle>
            </div>
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div2Ref}>
                <NodeJsIcon />
              </Circle>
              <Circle ref={div4Ref} className="size-16">
                <AndroidIcon />
              </Circle>
              <Circle ref={div6Ref}>
                <GitHubIcon />
              </Circle>
            </div>
            <div className="flex flex-row items-center justify-between">
              <Circle ref={div3Ref}>
                <ReactIcon />
              </Circle>
              <Circle ref={div7Ref}>
                <AWSIcon />
              </Circle>
            </div>
          </div>

          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div1Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div2Ref}
            toRef={div4Ref}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div3Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div5Ref}
            toRef={div4Ref}
            curvature={-75}
            endYOffset={-10}
            reverse
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div6Ref}
            toRef={div4Ref}
            reverse
          />
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={div7Ref}
            toRef={div4Ref}
            curvature={75}
            endYOffset={10}
            reverse
          />
        </div>
      </div>
    </div>
  );
}

interface CircleProps {
  children?: React.ReactNode;
  className?: string;
}

const Circle = forwardRef<HTMLDivElement, CircleProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={`z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] ${className}`}
      >
        {children}
      </div>
    );
  }
);
Circle.displayName = "Circle";
