/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { getPageTableOfContents } from "notion-utils";
import Image from "next/image";
import Link from "next/link";
import type { ExtendedRecordMap } from "notion-types";
import { Calendar } from "lucide-react";
import { findPageBlock } from "../../lib/notion-utils";
import { Tag } from "../../types/notion";
import { Label } from "../../components/ui/label";
import { Renderer } from "./Renderer";
import { cn } from "@/lib/utils";

interface PageInfo {
  date?: string;
  [key: string]: any;
}

interface TOCItemType {
  title: React.ReactNode;
  url: string;
  depth: number;
}

interface BlogPostProps {
  recordMap: ExtendedRecordMap & {
    pageInfo: PageInfo;
  };
}

type TableOfContents = TOCItemType[];

export function BlogPost({ recordMap }: BlogPostProps) {
  const { tags = [], cover, title, description } = recordMap.pageInfo || {};
  const safeTags = (tags as Tag[]) || [];

  const toc: TableOfContents = [];
  try {
    const pageBlock = findPageBlock(recordMap);
    if (pageBlock) {
      const items = getPageTableOfContents(pageBlock, recordMap);
      items.forEach((item) => {
        if (item?.id && item?.text) {
          toc.push({
            title: item.text,
            url: `#${item.id}`,
            depth: item.indentLevel || 0,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error generating TOC:", error);
  }
  console.log(toc);
  return (
    <>
      <div className="relative container px-4 py-8 lg:py-12 lg:px-6 text-left">
        {/* Cover Image */}
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden">
          <Image
            src={
              cover || `https://picsum.photos/400/225?grayscale&&title=${title}`
            }
            alt="Post cover"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>

        {/* Meta */}
        <div className="mb-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(
                recordMap.block[Object.keys(recordMap.block)[0]]?.value
                  ?.last_edited_time || ""
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <Label className="text-2xl font-bold mb-2 block capitalize">
          {title || "Untitled"}
        </Label>
        <p className="text-muted-foreground mb-4 italic font-serif">
          {description}
        </p>

        {safeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {safeTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.value}`}
                className="px-2.5 py-0.5 bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full text-xs font-medium"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          <aside className="hidden md:block md:col-span-1 sticky top-20 h-fit">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              On this page
            </h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {toc.map((item, idx) => (
                <li key={idx} className={cn(item.depth === 1 && "ml-4")}>
                  <a
                    href={item.url}
                    onClick={(e) => {
                      e.preventDefault();
                      const id = item.url.replace("#", "");
                      const el = document.getElementById(id);
                      if (el) {
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                    className="block hover:text-foreground transition"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="md:col-span-3 w-full">
            <div className="prose dark:prose-invert max-w-screen w-full overflow-hidden !important">
              <Renderer
                recordMap={recordMap}
                fullPage={false}
                darkMode={false}
                showTableOfContents={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
