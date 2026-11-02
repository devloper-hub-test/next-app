"use client";
import RetroGrid from "../../components/ui/retro-grid";
import Lottie from "lottie-react";
import React from "react";
import ShimmerButton from "../../components/ui/shimmer-button";
import animationData from "../Lottiefiles/HomeAnimation.json";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl px-4 py-12 lg:py-20">
      <RetroGrid className="text-red-700" />
      <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="text-center lg:pr-16 lg:text-left">
          <p className="mb-4 inline-block rounded-full border border-[#4DB6AC]/40 bg-[#4DB6AC]/10 px-4 py-1 text-xs font-medium text-[#2f8f86] dark:text-[#4DB6AC] lg:text-sm">
            Full Stack Developer
          </p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-black dark:text-white sm:text-4xl lg:text-6xl">
            Building Scalable Solutions for the Digital World
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0 lg:mt-6 lg:text-lg">
            Bringing ideas to life through code. From dynamic backends to
            captivating frontends, I build seamless web and mobile solutions
            that inspire and perform.
          </p>
          <div className="mt-8 flex items-center justify-center lg:mt-10 lg:justify-start">
            <a href="#projects">
              <ShimmerButton className="shadow-2xl">
                <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                  Explore My Work
                </span>
              </ShimmerButton>
            </a>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[520px]">
            <Lottie animationData={animationData} loop autoplay />
          </div>
        </div>
      </div>
    </section>
  );
}
