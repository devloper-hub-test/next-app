"use client";
import Link from "next/link";
import React from "react";
import Lottie from "lottie-react";
import lottieData from "../Lottiefiles/AnimationMobile.json";
import PortFolioIcon from "../../Icons/PortFolioIcon";
import JokePopup from "./JokePopup";
import { CustomText } from "../../customizer/CustomText";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/games", label: "Games" },
  { href: "/learn", label: "Learn" },
];

// TODO: replace the placeholder profile URLs with real ones
const SOCIAL_LINKS = [
  { href: "https://linkedin.com/in/yourname", label: "LinkedIn" },
  { href: "https://github.com/yourusername", label: "GitHub" },
  { href: "https://twitter.com/yourhandle", label: "Twitter" },
];

export default function Footer() {
  return (
    <footer
      className="rounded-3xl bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200"
      data-section="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 items-center">
          {/* Branding Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="flex items-center gap-3">
              <PortFolioIcon width={40} height={40} />
              <CustomText
                id="footer.name"
                as="p"
                className="font-dancing text-lg sm:text-xl font-semibold italic text-black dark:text-brand"
                role="heading accent"
              />
            </Link>
            <CustomText
              id="footer.tagline"
              as="p"
              className="mt-3 max-w-xs text-sm text-gray-600 dark:text-gray-400"
              role="text"
            />
            <div className="mt-4">
              <JokePopup />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 text-center md:text-left">
            <div>
              <CustomText id="footer.quickLinks" as="h4" className="text-lg font-semibold mb-4" role="heading" />
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm md:justify-start">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-black hover:underline underline-offset-4 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <CustomText id="footer.connect" as="h4" className="text-lg font-semibold mb-2" role="heading" />
              <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm md:justify-start">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-black hover:underline underline-offset-4 dark:hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Animation or Media Section */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="max-w-[150px] sm:max-w-[200px]">
              <Lottie animationData={lottieData} loop autoplay />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400" data-role="text">
            © {new Date().getFullYear()} <CustomText id="footer.copyright" />
          </p>
        </div>
      </div>
    </footer>
  );
}
