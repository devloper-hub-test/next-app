"use client";
import React, { useEffect, useState } from "react";
import ShinyButton from "./../../components/ui/shiny-button";
import DarkModeIcon from "../../Icons/DarkModeIcon";
import LightModeIcon from "../../Icons/LightModeIcon";
import PortFolioIcon from "../../Icons/PortFolioIcon";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for user preference in localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };
  return (
    <main className="fixed top-0 left-0 right-0 w-screen bg-white dark:bg-black z-50">
      <section className="flex items-center justify-between border-b px-4 py-2 shadow-sm lg:py-4">
        {/* <IconCloud iconSlugs={slugs} /> */}
        <div className="flex items-center">
          <div className="flex items-center px-2 pr-4">
            <div>
              <PortFolioIcon width={35} height={35} />
            </div>
            <p className="py-2 font-dancing capitalize text-xs sm:text-lg break-keep font-semibold italic text-black dark:text-[#4DB6AC]">
              Rahul verma
            </p>
          </div>
        </div>
        <div className="flex gap-x-4 items-center">
          <ShinyButton className="font-xs px-2 py-0 sm:py-2 sm:px-4">
            <div className="text-[6px] sm:text-xs">Download Resume</div>
          </ShinyButton>
          <div onClick={toggleDarkMode} className="w-12 flex cursor-pointer">
            {isDarkMode ? (
              <span className="bg-[#1e1e1e] p-1 rounded-full">
                <DarkModeIcon />
              </span>
            ) : (
              <span className="bg-[#f6f5f5] p-1 rounded-full">
                <LightModeIcon />
              </span>
            )}
          </div>
          {/* <div className="uppercase text-sm">profile section</div> */}
        </div>
      </section>
    </main>
  );
}
