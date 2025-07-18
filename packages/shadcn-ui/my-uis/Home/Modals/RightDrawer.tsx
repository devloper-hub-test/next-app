"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";
import { Button } from "../../../components/ui/button";
import { ReactNode } from "react";

interface RightDrawerProps {
  footerComponent?: ReactNode;
  title: string;
  description: string;
  openText: string;
  children: ReactNode;
}

export default function RightDrawer({
  footerComponent,
  title,
  description,
  openText = "Open",
  children,
}: RightDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="fixed bottom-4 right-8 z-50 flex items-center gap-2 rounded-full font-mono px-4 lg:px-8 py-2 lg:py-6 border border-gray-300 dark:border-gray-600 bg-white text-black dark:bg-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-blue-500 dark:text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z" />
          </svg>
          {openText}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-3/4 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-screen overflow-y-auto py-4 bg-white dark:bg-black"
      >
        <SheetHeader>
          <SheetTitle className="text-center">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-center">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="mt-4">{children}</div>

        {footerComponent && <SheetFooter>{footerComponent}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
