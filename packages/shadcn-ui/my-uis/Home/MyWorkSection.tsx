import ReactIcon from "../../Icons/ReactIcon";
import NodeJsIcon from "../../Icons/NodeJsIcon";
import JavaScriptIcon from "../../Icons/JavaScriptIcon";
import AWSIcon from "../../Icons/AWSIcon";
import OrbitingCircles from "../../components/ui/orbiting-circles";
import React from "react";
import TailwindIcon from "../../Icons/TailwindIcon";
import MySQLIcon from "../../Icons/MySQLIcon";
import BlurFade from "../../components/ui/blur-fade";
// import TailwindIcon from "@/Icons/TailwindIcon";
// import { BorderBeam } from "../../components/ui/border-beam";

export default function MyWorkSection() {
  return (
    <BlurFade key={"imageUrl"} delay={0.3} inView>
      <div>
        <h4 className="text-center text-2xl lg:text-5xl">My Work</h4>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-center mt-4">
        <BlurFade key={"imageUrl"} delay={0.35} inView>
          <div className="lg:hidden">
            <div className="relative flex h-[220px] lg:h-[450px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
              <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-sm lg:text-4xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
                App
              </span>

              {/* Inner Circles */}
              <OrbitingCircles
                className="size-[30px] border-none bg-transparent dark:bg-white dark:p-1"
                duration={20}
                delay={20}
                radius={30}
              >
                <ReactIcon />
              </OrbitingCircles>

              <OrbitingCircles
                className="size-[30px] border-none bg-transparent dark:bg-white dark:p-1"
                duration={20}
                delay={10}
                radius={30}
              >
                <NodeJsIcon />
              </OrbitingCircles>

              {/* Outer Circles (reverse) */}

              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={90}
                duration={20}
                reverse
              >
                <JavaScriptIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent dark:bg-white dark:p-1"
                radius={90}
                duration={20}
                delay={20}
                reverse
              >
                <AWSIcon />
              </OrbitingCircles>

              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={90}
                duration={20}
                delay={5}
                reverse
              >
                <TailwindIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={90}
                duration={20}
                delay={15}
                reverse
              >
                <MySQLIcon />
              </OrbitingCircles>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative flex h-[220px] lg:h-[450px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background">
              <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-sm lg:text-4xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
                App
              </span>
              {/* Inner Circles */}
              <OrbitingCircles
                className="size-[30px] border-none bg-transparent dark:bg-white dark:p-1"
                duration={20}
                delay={20}
                radius={80}
              >
                <ReactIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[30px] border-none bg-transparent dark:bg-white dark:p-1"
                duration={20}
                delay={10}
                radius={80}
              >
                <NodeJsIcon />
              </OrbitingCircles>
              {/* Outer Circles (reverse) */}
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={170}
                duration={20}
                reverse
              >
                <JavaScriptIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent dark:bg-white dark:p-1"
                radius={170}
                duration={20}
                delay={20}
                reverse
              >
                <AWSIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={170}
                duration={20}
                delay={5}
                reverse
              >
                <TailwindIcon />
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={170}
                duration={20}
                delay={15}
                reverse
              >
                <MySQLIcon />
              </OrbitingCircles>
            </div>
          </div>
        </BlurFade>
        <BlurFade key={"imageUrl"} delay={0.4} inView>
          <div className="lg:pr-20 text-xs lg:text-lg leading-5 lg:leading-8 lg:tracking-wide capitalize break-words text-center lg:text-left">
            I excel in crafting scalable, user-focused applications using
            cutting-edge technologies. With extensive experience in Node.js,
            React, and React Native, I have developed web and mobile solutions
            that emphasize both performance and functionality. By utilizing
            Tailwind CSS, I design responsive and visually captivating
            interfaces, ensuring a seamless user experience across platforms. My
            projects demonstrate proficiency in modern tools and frameworks,
            highlighting expertise in both frontend and backend development for
            robust, end-to-end solutions.{" "}
          </div>
        </BlurFade>
      </div>
    </BlurFade>
  );
}
