// import Image from "next/image";
import RetroGrid from "../../components/ui/retro-grid";
import React from "react";
import ShimmerButton from "../../components/ui/shimmer-button";
import IconCloud from "../../components/ui/icon-cloud";

export default function HeroSection() {
  const slugs = [
    "typescript",
    "javascript",
    // "dart",
    "java",
    "react",
    // "flutter",
    "android",
    "html5",
    "css3",
    "nodedotjs",
    "express",
    "nextdotjs",
    // "prisma",
    "amazonaws",
    "postgresql",
    "firebase",
    "nginx",
    "vercel",
    "testinglibrary",
    "jest",
    // "cypress",
    "docker",
    "git",
    "jira",
    "github",
    "gitlab",
    "visualstudiocode",
    "androidstudio",
    // "sonarqube",
    "figma",
  ];
  return (
    <div className="rounded-md px-4 relative">
      <RetroGrid className="" />
      <section className="grid grid-cols-2 gap-8">
        <div className="pr-24">
          <div className="font-sans text-5xl leading-snug tracking-widest font-bold text-black dark:text-white capitalize">
            Building Scalable Solutions for the Digital World
          </div>
          <div className="mt-8 text-2xl capitalize">
            Bringing ideas to life through code. From dynamic backends to
            captivating frontends, I build seamless web and mobile solutions
            that inspire and perform
          </div>
          <div className="mt-12">
            <ShimmerButton className="shadow-2xl">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Explore My Work
              </span>
            </ShimmerButton>
          </div>
        </div>
        <div className="px-14 pb-14 pt-4">
          {/* <Image
            src="/HEROImage.webp"
            alt="hero image"
            height={100}
            width={100}
            className="w-full  object-cover rounded-xl shadow-2xl shadow-slate-500"
          /> */}
          <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg bg-transparent dark:bg-white px-20 pb-20 pt-8 ">
            <IconCloud iconSlugs={slugs} />
          </div>
        </div>
      </section>
    </div>
  );
}
