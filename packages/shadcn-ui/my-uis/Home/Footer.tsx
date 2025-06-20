"use client";
import Link from "next/link";
import React from "react";
import Lottie from "lottie-react";
import lottieData from "../Lottiefiles/AnimationMobile.json";
import PortFolioIcon from "../../Icons/PortFolioIcon";
import JokePopup from "./JokePopup";

export default function Footer() {
  console.log("initial log");
  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-700 dark:text-white rounded-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 lg:gap-8 items-center justify-center">
          {/* Branding Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="flex items-center space-x-3">
              <PortFolioIcon width={40} height={40} />
              <p className="font-dancing text-lg sm:text-xl font-semibold italic text-black dark:text-[#4DB6AC]">
                Rahul Verma
              </p>
            </Link>
            <p className="mt-4 text-sm">Download Apps</p>
            <div>
              <JokePopup />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 text-center md:text-left">
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 text-sm justify-center md:justify-start">
                <Link href="/" className="hover:underline">
                  Home
                </Link>
                <Link href="/about" className="hover:underline">
                  About Me
                </Link>
                <Link href="/projects" className="hover:underline">
                  Projects
                </Link>
                <Link href="/contact" className="hover:underline">
                  Contact
                </Link>
                <Link href="/blog" className="hover:underline">
                  Blog
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Let's Connect</h4>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <Link
                  href="https://linkedin.com/in/yourname"
                  target="_blank"
                  className="hover:underline"
                >
                  LinkedIn
                </Link>
                <Link
                  href="https://github.com/yourusername"
                  target="_blank"
                  className="hover:underline"
                >
                  GitHub
                </Link>
                <Link
                  href="https://twitter.com/yourhandle"
                  target="_blank"
                  className="hover:underline"
                >
                  Twitter
                </Link>
              </div>
            </div>
          </div>

          {/* Animation or Media Section */}
          <div className="flex flex-col items-center lg:items-end gap-4">
            <div className="max-w-[150px] sm:max-w-[200px]">
              <Lottie animationData={lottieData} loop autoplay />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 dark:border-gray-700 mt-8 pt-4">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Rahul Verma. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
