"use client";
import { Card, CardContent } from "../../components/ui/card";
import React from "react";

import Lottie from "lottie-react";
import AnimationAuction from "../Lottiefiles/AnimationAuction.json";
import AnimationFinTech from "../Lottiefiles/AnimationFinTech.json";
import Link from "next/link";
import SectionHeading from "./SectionHeading";
import { CustomText } from "../../customizer/CustomText";

interface Project {
  name: string;
  body: string;
  lottieData: object;
  // External project URL; cards without one are not clickable
  link?: string;
}

const PROJECTS: Project[] = [
  {
    name: "FinCase",
    body: "FinCase focuses on providing tailored financial solutions to optimize investment management and streamline loan accessibility. While specific details are scarce, it positions itself as a comprehensive platform for managing loans and financial products.",
    lottieData: AnimationFinTech,
  },
  {
    name: "FinEzzy",
    body: "FinEzzy is a fintech platform offering Loans Against Mutual Funds (LAMF). It allows users to unlock liquidity from their mutual fund investments, ensuring quick and hassle-free access to funds. By bridging the gap between traditional loans and financial flexibility, FinEzzy caters to individuals seeking to leverage their existing investments without liquidation.",
    lottieData: AnimationFinTech,
  },
  {
    name: "Auction Bazaar",
    body: "Auction Bazaar is an online marketplace offering auction-based solutions where users can explore and participate in real-time auctions for various financial or digital assets. It provides transparency and accessibility for individuals and businesses looking to buy or sell via competitive bidding.",
    lottieData: AnimationAuction,
  },
];

export default function Projects() {
  return (
    <div data-section="projects">
      <SectionHeading subtitleId="projects.subtitle" textId="projects.heading" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.name} project={project} />
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <Link
          href="/projects"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
          data-role="accent"
        >
          <CustomText id="projects.cta" />
        </Link>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const card = (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900">
      <div className="flex h-48 items-center justify-center bg-gray-50 p-4 dark:bg-gray-800/50 lg:h-56">
        <div className="h-full max-w-[220px]">
          <Lottie animationData={project.lottieData} loop autoplay className="h-full" />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col px-5 py-6 lg:px-6">
        <h3 className="text-xl font-semibold text-black dark:text-white" data-role="heading">
          {project.name}
        </h3>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300" data-role="text">
          {project.body}
        </p>
      </CardContent>
    </Card>
  );

  if (!project.link) return card;

  return (
    <a href={project.link} target="_blank" rel="noopener noreferrer" className="block h-full">
      {card}
    </a>
  );
}
