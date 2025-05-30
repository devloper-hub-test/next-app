import {
  Header,
  HeroSection,
  ThemeProvider,
  MyWorkSection,
  MyTechStackSection,
  Projects,
  Footer,
  AboutMe,
} from "shadcn-ui";

export default function Page(): JSX.Element {
  return (
    <div className="bg-white dark:bg-black">
      <ThemeProvider>
        <main className="max-w-7xl w-full py-4 px-2 mx-auto grid grid-cols-1 gap-y-4 lg:gap-y-24">
          <Header />
          <HeroSection />
          <AboutMe />
          <MyWorkSection />
          <MyTechStackSection />
          <Projects />
          <Footer />
        </main>
      </ThemeProvider>
    </div>
  );
}
