/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useMemo, useState } from "react";
import { getPageTableOfContents } from "notion-utils";
import Link from "next/link";
import type { ExtendedRecordMap } from "notion-types";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { findPageBlock } from "../../lib/notion-utils";
import { Tag } from "../../types/notion";
import { Renderer } from "./Renderer";
import { PostCover } from "./PostCover";
import { cn } from "@/lib/utils";

interface PageInfo {
  date?: string;
  [key: string]: any;
}

interface TOCItemType {
  id: string;
  title: React.ReactNode;
  depth: number;
}

interface BlogPostProps {
  recordMap: ExtendedRecordMap & {
    pageInfo: PageInfo;
  };
}

const WORDS_PER_MINUTE = 200;

function getReadingMinutes(recordMap: ExtendedRecordMap) {
  let words = 0;
  Object.values(recordMap.block).forEach((block: any) => {
    const title = block?.value?.properties?.title;
    if (!Array.isArray(title)) return;
    const text = title.map((chunk: any[]) => chunk?.[0] ?? "").join("");
    words += text.split(/\s+/).filter(Boolean).length;
  });
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function getToc(recordMap: ExtendedRecordMap): TOCItemType[] {
  try {
    const pageBlock = findPageBlock(recordMap);
    if (!pageBlock) return [];
    return getPageTableOfContents(pageBlock, recordMap)
      .filter((item) => item?.id && item?.text)
      .map((item) => ({
        id: item.id,
        title: item.text,
        depth: item.indentLevel || 0,
      }));
  } catch (error) {
    console.error("Error generating TOC:", error);
    return [];
  }
}

// The site toggles dark mode via a class on <html>, so watch that class
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-90px 0px -70% 0px" },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return activeId;
}

export function BlogPost({ recordMap }: BlogPostProps) {
  const { tags = [], cover, title, description, createdAt } =
    recordMap.pageInfo || {};
  const safeTags = (tags as Tag[]) || [];

  const toc = useMemo(() => getToc(recordMap), [recordMap]);
  const tocIds = useMemo(() => toc.map((item) => item.id), [toc]);
  const readingMinutes = useMemo(() => getReadingMinutes(recordMap), [recordMap]);
  const isDarkMode = useIsDarkMode();
  const activeId = useActiveHeading(tocIds);

  const publishedAt = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="group mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        All posts
      </Link>

      <header className="mx-auto max-w-3xl text-center">
        {safeTags.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {safeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.value}`}
                className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-strong transition-colors hover:bg-brand/20 dark:text-brand"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl dark:text-white">
          {title || "Untitled"}
        </h1>
        {description && (
          <p className="mt-5 text-base text-gray-600 sm:text-lg dark:text-gray-400">
            {description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          {publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" />
              {publishedAt}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {readingMinutes} min read
          </span>
        </div>
      </header>

      <div className="mt-10 aspect-[21/9] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10">
        <PostCover title={title || "Untitled"} cover={cover} />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="mx-auto w-full min-w-0 max-w-3xl">
          <Renderer
            recordMap={recordMap}
            fullPage={false}
            darkMode={isDarkMode}
            showTableOfContents={false}
          />
        </div>

        {toc.length > 0 && (
          <aside className="hidden lg:block">
            <nav className="sticky top-28">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                On this page
              </p>
              <ul className="space-y-1 border-l border-gray-200 text-sm dark:border-white/10">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => scrollToHeading(e, item.id)}
                      className={cn(
                        "-ml-px block border-l-2 py-1 pl-3 transition-colors",
                        item.depth > 0 && "pl-6",
                        activeId === item.id
                          ? "border-brand font-medium text-black dark:text-white"
                          : "border-transparent text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white",
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}
      </div>
    </article>
  );
}
