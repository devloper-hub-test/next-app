import ReactIcon from "../../Icons/ReactIcon";
import NodeJsIcon from "../../Icons/NodeJsIcon";
import JavaScriptIcon from "../../Icons/JavaScriptIcon";
import AWSIcon from "../../Icons/AWSIcon";
import OrbitingCircles from "../../components/ui/orbiting-circles";
import React, { ReactNode } from "react";
import TailwindIcon from "../../Icons/TailwindIcon";
import MySQLIcon from "../../Icons/MySQLIcon";
import BlurFade from "../../components/ui/blur-fade";
import AndroidIcon from "../../Icons/AndroidIcon";
import GitHubIcon from "../../Icons/GitHubIcon";
import SectionHeading from "./SectionHeading";
import BrandIcon from "./BrandIcon";

interface OrbitItem {
  name: string;
  icon: ReactNode;
}

interface Ring {
  radius: number;
  duration: number;
  iconSize: number;
  reverse?: boolean;
  items: OrbitItem[];
}

const brand = (slug: string, name: string): OrbitItem => ({
  name,
  icon: <BrandIcon slug={slug} name={name} />,
});

const RINGS: Ring[] = [
  {
    radius: 85,
    duration: 22,
    iconSize: 44,
    items: [
      { name: "React", icon: <ReactIcon /> },
      { name: "Node.js", icon: <NodeJsIcon /> },
      brand("typescript", "TypeScript"),
    ],
  },
  {
    radius: 150,
    duration: 32,
    iconSize: 44,
    reverse: true,
    items: [
      { name: "JavaScript", icon: <JavaScriptIcon /> },
      brand("nextdotjs", "Next.js"),
      { name: "Tailwind CSS", icon: <TailwindIcon /> },
      brand("redux", "Redux"),
      brand("expo", "Expo"),
    ],
  },
  {
    radius: 215,
    duration: 44,
    iconSize: 48,
    items: [
      { name: "AWS", icon: <AWSIcon /> },
      { name: "MySQL", icon: <MySQLIcon /> },
      brand("mongodb", "MongoDB"),
      brand("postgresql", "PostgreSQL"),
      brand("docker", "Docker"),
      brand("firebase", "Firebase"),
      { name: "Android", icon: <AndroidIcon /> },
      { name: "GitHub", icon: <GitHubIcon /> },
    ],
  },
];

// Orbit is laid out at desktop size and scaled down on smaller screens
const ORBIT_SIZE = 500;

function TechOrbit() {
  return (
    <div className="group flex h-[300px] w-full items-center justify-center overflow-hidden sm:h-[400px] lg:h-[500px]">
      <div
        className="relative shrink-0 scale-[0.58] sm:scale-[0.78] lg:scale-100"
        style={{ width: ORBIT_SIZE, height: ORBIT_SIZE }}
      >
        <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(77,182,172,0.18)_0%,transparent_65%)]" />

        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {RINGS.map((ring) => (
            <circle
              key={ring.radius}
              cx="50%"
              cy="50%"
              r={ring.radius}
              fill="none"
              strokeDasharray="4 6"
              className="stroke-black/15 dark:stroke-white/15"
            />
          ))}
        </svg>

        <div
          title="Full Stack"
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#4DB6AC]/40 bg-white shadow-[0_0_24px_rgba(77,182,172,0.35)] dark:bg-neutral-950"
        >
          <span className="absolute inset-0 animate-ping rounded-full border border-[#4DB6AC]/30 [animation-duration:3s]" />
          <span className="font-mono text-base font-bold text-[#4DB6AC]">&lt;/&gt;</span>
        </div>

        {RINGS.map((ring) =>
          ring.items.map((item, i) => (
            <OrbitingCircles
              key={item.name}
              path={false}
              radius={ring.radius}
              duration={ring.duration}
              // Spread icons evenly around the ring
              delay={(ring.duration * i) / ring.items.length}
              reverse={ring.reverse}
              className="pointer-events-none border-none bg-transparent group-hover:[animation-play-state:paused] dark:bg-transparent"
            >
              <div
                title={item.name}
                className="pointer-events-auto flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 shadow-md transition-transform duration-200 hover:scale-125 dark:border-white/10 dark:shadow-black/50 [&>*]:size-full"
                style={{ width: ring.iconSize, height: ring.iconSize }}
              >
                {item.icon}
              </div>
            </OrbitingCircles>
          )),
        )}
      </div>
    </div>
  );
}

export default function MyWorkSection() {
  return (
    <BlurFade delay={0.3} inView>
      <SectionHeading>My Work</SectionHeading>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <BlurFade delay={0.35} inView>
          <TechOrbit />
        </BlurFade>
        <BlurFade delay={0.4} inView>
          <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300 lg:pr-12 lg:text-left lg:text-lg lg:leading-8">
            I excel in crafting scalable, user-focused applications using
            cutting-edge technologies. With extensive experience in Node.js,
            React, and React Native, I have developed web and mobile solutions
            that emphasize both performance and functionality. By utilizing
            Tailwind CSS, I design responsive and visually captivating
            interfaces, ensuring a seamless user experience across platforms. My
            projects demonstrate proficiency in modern tools and frameworks,
            highlighting expertise in both frontend and backend development for
            robust, end-to-end solutions.
          </p>
        </BlurFade>
      </div>
    </BlurFade>
  );
}
