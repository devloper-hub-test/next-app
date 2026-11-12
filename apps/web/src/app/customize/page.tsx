import type { Metadata } from "next";
import { CustomizeDashboard } from "shadcn-ui";

export const metadata: Metadata = {
  title: "Customize · Rahul Verma",
  robots: { index: false },
};

export default function CustomizePage(): JSX.Element {
  return <CustomizeDashboard />;
}
