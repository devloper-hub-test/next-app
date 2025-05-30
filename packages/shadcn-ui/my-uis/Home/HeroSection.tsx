"use client";
// import Image from "next/image";
import RetroGrid from "../../components/ui/retro-grid";
import Lottie from "lottie-react";
import React from "react";
import ShimmerButton from "../../components/ui/shimmer-button";
import animationData from "../Lottiefiles/HomeAnimation.json";
// import { InteractiveGridPattern } from "../../components/magicui/interactive-grid-pattern";

export default function HeroSection() {
  return (
    <div className="rounded-md px-4 relative pt-14 my-12 overflow-hidden">
      <RetroGrid className="text-red-700" />
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 items-center">
        <div className="pr-0 lg:pr-24">
          <div className="font-sans text-2xl lg:text-5xl leading-snug tracking-widest font-bold text-black dark:text-white capitalize text-center lg:text-left">
            Building Scalable Solutions for the Digital World
          </div>
          <div className="mt-4 lg:mt-8 text-sm lg:text-xl capitalize font-mono tracking-tight text-center lg:text-left">
            Bringing ideas to life through code. From dynamic backends to
            captivating frontends, I build seamless web and mobile solutions
            that inspire and perform
          </div>
          <div className="mt-6 lg:mt-12 flex items-center justify-center lg:justify-start">
            <ShimmerButton className="shadow-2xl">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Explore My Work
              </span>
            </ShimmerButton>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="max-w-[400px] lg:max-w-none">
            <Lottie animationData={animationData} loop={true} autoplay={true} />
          </div>
        </div>
      </section>
    </div>
  );
}
