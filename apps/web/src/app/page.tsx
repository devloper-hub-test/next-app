import {
  Header,
  HeroSection,
  ThemeProvider,
  MyWorkSection,
  MyTechStackSection,
  Projects,
  Footer,
  AboutMe,
  ChatBot,
} from "shadcn-ui";

export default function Page(): JSX.Element {
  return (
    <div className="min-h-screen bg-background text-gray-800 dark:text-gray-200">
      <ThemeProvider>
        {/* Fixed header and floating chat button live outside the content grid */}
        <Header />
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-28 pb-24 flex flex-col gap-y-16 lg:gap-y-28">
          <HeroSection />
          <section className="scroll-mt-24" id="about">
            <AboutMe />
          </section>
          <section className="scroll-mt-24" id="work">
            <MyWorkSection />
          </section>
          <section className="scroll-mt-24" id="mobile">
            <MyTechStackSection />
          </section>
          <section className="scroll-mt-24" id="projects">
            <Projects />
          </section>
        </main>
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <Footer />
        </div>
        <ChatBot />
      </ThemeProvider>
    </div>
  );
}
