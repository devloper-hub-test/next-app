import type { ReactNode } from "react";
import { Header } from "shadcn-ui";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col divide-y divide-dashed divide-border/70 border-border/70 border-dashed sm:border-b dark:divide-border dark:border-border blog">
      <Header />
      <div className="mt-12">{children}</div>
    </div>
  );
}
