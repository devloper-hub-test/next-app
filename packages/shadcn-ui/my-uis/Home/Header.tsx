"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Menu, Moon, Sun, X } from "lucide-react";
import PortFolioIcon from "../../Icons/PortFolioIcon";
import { CustomText } from "../../customizer/CustomText";
import type { TextId } from "../../customizer/schema";

const RESUME_URL =
  "https://drive.google.com/uc?export=download&id=1A1JviBdnVaqHOLs58CbxvMPQD7eS8FbF";

const NAV_LINKS: { href: string; textId: TextId; section?: string }[] = [
  { href: "/#about", textId: "header.nav.about", section: "about" },
  { href: "/#work", textId: "header.nav.work", section: "work" },
  { href: "/#projects", textId: "header.nav.projects", section: "projects" },
  { href: "/blog", textId: "header.nav.blog" },
  { href: "/games", textId: "header.nav.games" },
  { href: "/learn", textId: "header.nav.learn" },
];

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // The theme class is applied before paint in layout.tsx; sync state with it
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for whichever home-page section is in view
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const sections = NAV_LINKS.flatMap((link) =>
      link.section ? [document.getElementById(link.section)] : [],
    ).filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => setIsMenuOpen(false), [pathname]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDarkMode(next);
  };

  const isActive = (link: (typeof NAV_LINKS)[number]) =>
    link.section
      ? pathname === "/" && activeSection === link.section
      : pathname.startsWith(link.href);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 lg:px-8">
      <div
        className={`mx-auto max-w-7xl rounded-2xl border transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? "border-gray-200/80 bg-white/75 shadow-lg shadow-black/5 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/70 dark:shadow-black/40"
            : "border-transparent bg-transparent"
        }`}
        data-section="header"
      >
        <nav className="flex h-14 items-center justify-between px-3 sm:px-4">
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="transition-transform duration-300 group-hover:rotate-12">
              <PortFolioIcon width={32} height={32} />
            </span>
            <CustomText
              id="header.name"
              className="font-dancing whitespace-nowrap text-lg font-semibold italic text-black sm:text-xl dark:text-brand"
              role="heading"
            />
          </Link>

          <ul className="hidden items-center gap-1 rounded-full border border-gray-200/80 bg-gray-50/80 p-1 md:flex dark:border-white/10 dark:bg-white/5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.href} className="relative">
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    className={`relative block rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "text-black dark:text-white"
                        : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                    }`}
                    data-role="text"
                  >
                    <CustomText id={link.textId} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-md sm:inline-flex dark:bg-brand dark:text-black"
              data-role="accent-bg"
            >
              <Download className="h-3.5 w-3.5" />
              <CustomText id="header.resume" />
            </a>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDarkMode ? "moon" : "sun"}
                  initial={{ y: -16, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 16, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDarkMode ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:bg-gray-100 md:hidden dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden md:hidden"
            >
              <ul className="flex flex-col gap-1 border-t border-gray-200/80 px-3 py-3 dark:border-white/10">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link)
                          ? "bg-gray-100 text-black dark:bg-white/10 dark:text-white"
                          : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      }`}
                    >
                      <CustomText id={link.textId} />
                    </Link>
                  </li>
                ))}
                <li className="pt-1 sm:hidden">
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-semibold text-white dark:bg-brand dark:text-black"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
