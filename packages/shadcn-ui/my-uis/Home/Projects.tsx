"use client";
import { Card, CardContent } from "../../components/ui/card";
import React from "react";

import Lottie from "lottie-react";
import AnimationAuction from "../Lottiefiles/AnimationAuction.json";
import AnimationFinTech from "../Lottiefiles/AnimationFinTech.json";
import Link from "next/link";
export default function Projects() {
  const reviews = [
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
      name: "Auction bazaar",
      body: "Auction Bazaar is an online marketplace offering auction-based solutions where users can explore and participate in real-time auctions for various financial or digital assets. It provides transparency and accessibility for individuals and businesses looking to buy or sell via competitive bidding.",
      lottieData: AnimationAuction,
    },
    {
      name: "Auction bazaar",
      body: "Auction Bazaar is an online marketplace offering auction-based solutions where users can explore and participate in real-time auctions for various financial or digital assets. It provides transparency and accessibility for individuals and businesses looking to buy or sell via competitive bidding.",
      lottieData: AnimationAuction,
    },
  ];
  return (
    <section className="py-10">
      <div className="flex justify-center items-center">
        <div className="w-full font-semibold text-3xl lg:text-5xl text-center mb-6">
          Projects
        </div>
        <Link
          href={"/projects"}
          className="break-keep w-24 flex items-center justify-center text-xs lg:text-sm text-black dark:text-white cursor-pointer font-semibold capitalize"
        >
          View all
        </Link>
      </div>
      <div className="mt-6 lg:mt-12">
        <div className="p-1 w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 lg:gap-y-6 justify-center">
          {reviews.map((d, index) => (
            <div key={index} className="max-w-[380px] lg:max-w-[400px]">
              <ProjectCard
                title={d.name}
                description={d.body}
                lottieData={d.lottieData}
                link="/"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
interface ProjectCardProps {
  title: string;
  description: string;
  lottieData: object;
  link: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  lottieData,
  link,
}) => {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow cursor-pointer rounded-3xl  bg-white dark:bg-gray-900">
        <CardContent className="py-6 lg:py-12 px-4 lg:px-6 flex flex-col items-center gap-4">
          <div className="text-center flex flex-col">
            <h3 className="text-xl font-semibold mb-1">{title}</h3>
            <div className="flex justify-center max-h-[240px]">
              <Lottie animationData={lottieData} loop autoplay />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
