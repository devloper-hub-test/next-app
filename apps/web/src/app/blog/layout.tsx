import type { ReactNode } from "react";
import { Header, Footer } from "shadcn-ui";

export default function Layout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="blog flex min-h-screen flex-col bg-white text-gray-800 dark:bg-black dark:text-gray-200">
      <Header />
      <main className="flex-1 pt-28 lg:pt-32">{children}</main>
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
}
