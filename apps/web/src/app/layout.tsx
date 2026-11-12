import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CustomizerProvider, PREPAINT_SCRIPT } from "shadcn-ui";

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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Apply the saved theme before paint to avoid a light-mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
        {/* Re-apply the visitor's saved customizations before paint (no flash of the default look) */}
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* Visitors' own look-and-feel changes (edited at /customize), saved in their browser only */}
        <CustomizerProvider>{children}</CustomizerProvider>
      </body>
    </html>
  );
}
