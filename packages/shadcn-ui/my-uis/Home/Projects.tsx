import Marquee from "../../components/ui/marquee";
import React from "react";

export default function Projects() {
  const reviews = [
    {
      name: "FinCase page",
      body: "FinCase focuses on providing tailored financial solutions to optimize investment management and streamline loan accessibility. While specific details are scarce, it positions itself as a comprehensive platform for managing loans and financial products.",
      img: "https://avatar.vercel.sh/jack",
    },
    {
      name: "FinEzzy page",
      body: "FinEzzy is a fintech platform offering Loans Against Mutual Funds (LAMF). It allows users to unlock liquidity from their mutual fund investments, ensuring quick and hassle-free access to funds. By bridging the gap between traditional loans and financial flexibility, FinEzzy caters to individuals seeking to leverage their existing investments without liquidation.",
      img: "https://avatar.vercel.sh/jack",
    },
    {
      name: "Auction bazaar page",
      body: "Auction Bazaar is an online marketplace offering auction-based solutions where users can explore and participate in real-time auctions for various financial or digital assets. It provides transparency and accessibility for individuals and businesses looking to buy or sell via competitive bidding.",
      img: "https://avatar.vercel.sh/jack",
    },

    // {
    //   name: "Jill",
    //   body: "I don't know what to say. I'm speechless. This is amazing.",
    //   img: "https://avatar.vercel.sh/jill",
    // },
    // {
    //   name: "John",
    //   body: "I'm at a loss for words. This is amazing. I love it.",
    //   img: "https://avatar.vercel.sh/john",
    // },
  ];
  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);
  return (
    <section>
      <div className="text-5xl text-center">Projects</div>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background mt-12">
        <Marquee pauseOnHover className="[--duration:60s]">
          {firstRow.map((review) => (
            <ReviewCard key={review?.name} {...review} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:60s]">
          {secondRow.map((review) => (
            <ReviewCard key={review?.name} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    </section>
  );
}

const ReviewCard = ({
  img,
  showImg = false,
  name,
  username,
  body,
}: {
  img?: string;
  showImg?: boolean;
  name?: string;
  username?: string;
  body?: string;
}) => {
  return (
    <div>
      <figure
        className={
          "relative w-96 h-full cursor-pointer overflow-hidden rounded-xl border p-4 border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
        }
      >
        <div className="flex flex-row items-center gap-2">
          {showImg && (
            <img
              className="rounded-full"
              width="32"
              height="32"
              alt=""
              src={img}
            />
          )}
          <div className="w-9 h-9 rounded-full bg-[#494191] text-white uppercase text-center flex justify-center items-center">
            {name?.split("")[0]}
          </div>
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
          </div>
        </div>
        {username && (
          <p className="text-xs font-medium mt-2 dark:text-white/40">
            {username}
          </p>
        )}
        <blockquote className="mt-2 text-sm">{body}</blockquote>
      </figure>
    </div>
  );
};
