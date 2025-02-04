import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rahul Verma - Full Stack Developer",
  description:
    "Welcome to the portfolio of Rahul Verma, a passionate Full Stack Developer specializing in React.js, Next.js, Node.js, and React Native. Explore my projects, skills, and journey.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
