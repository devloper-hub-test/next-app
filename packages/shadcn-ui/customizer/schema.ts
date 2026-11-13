// customizer/schema.ts
// What visitors (and later, the admin) can customise, and how saved settings are validated.
// Only these known keys are ever applied, so stored data can't inject arbitrary CSS or HTML.
import { z } from "zod";

/** Theme colours, each mapped to a CSS variable the whole site already uses */
export const COLOR_TOKENS = {
  brand: { label: "Accent", cssVar: "--brand", hint: "Highlights, badges, links" },
  primary: { label: "Buttons", cssVar: "--primary", hint: "Main buttons and active items" },
  background: { label: "Page background", cssVar: "--background", hint: "Behind everything" },
  foreground: { label: "Text", cssVar: "--foreground", hint: "Main text colour" },
  card: { label: "Cards", cssVar: "--card", hint: "Panels and cards" },
  border: { label: "Borders", cssVar: "--border", hint: "Lines and outlines" },
} as const;
export type ColorToken = keyof typeof COLOR_TOKENS;

/** The built-in colours (from globals.css), shown in colour pickers until changed */
export const DEFAULT_COLORS: Record<"light" | "dark", Record<ColorToken, string>> = {
  light: { brand: "#4db6ac", primary: "#18181b", background: "#ffffff", foreground: "#09090b", card: "#ffffff", border: "#e4e4e7" },
  dark: { brand: "#4db6ac", primary: "#fafafa", background: "#09090b", foreground: "#fafafa", card: "#09090b", border: "#27272a" },
};

export const FONTS = {
  default: { label: "Inter (default)", stack: "" },
  system: { label: "System", stack: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif" },
  rounded: { label: "Rounded", stack: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif" },
  serif: { label: "Serif", stack: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" },
  mono: { label: "Monospace", stack: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace" },
} as const;
export type FontId = keyof typeof FONTS;

/** Page sections that can be styled individually */
export const SECTIONS = {
  header: { label: "Header", canHide: false },
  hero: { label: "Hero (top of home page)", canHide: true },
  about: { label: "About me", canHide: true },
  work: { label: "My work", canHide: true },
  mobile: { label: "Mobile apps", canHide: true },
  projects: { label: "Projects", canHide: true },
  footer: { label: "Footer", canHide: true },
} as const;
export type SectionId = keyof typeof SECTIONS;

export const SHADOWS = {
  none: "none",
  sm: "0 1px 3px rgb(0 0 0 / 0.1)",
  md: "0 6px 16px rgb(0 0 0 / 0.12)",
  lg: "0 12px 32px rgb(0 0 0 / 0.16)",
  xl: "0 24px 56px rgb(0 0 0 / 0.22)",
} as const;
export type ShadowId = keyof typeof SHADOWS;

/** Every editable piece of text, with its default and where it lives */
export const TEXTS = {
  "header.name": { section: "header", label: "Site name", default: "Rahul Verma" },
  "header.nav.about": { section: "header", label: "Nav: About", default: "About" },
  "header.nav.work": { section: "header", label: "Nav: Work", default: "Work" },
  "header.nav.projects": { section: "header", label: "Nav: Projects", default: "Projects" },
  "header.nav.blog": { section: "header", label: "Nav: Blog", default: "Blog" },
  "header.nav.games": { section: "header", label: "Nav: Games", default: "Games" },
  "header.nav.learn": { section: "header", label: "Nav: Learn", default: "Learn" },
  "header.resume": { section: "header", label: "Resume button", default: "Resume" },
  "hero.badge": { section: "hero", label: "Badge", default: "Full Stack Developer" },
  "hero.title": { section: "hero", label: "Headline", default: "Building Scalable Solutions for the Digital World" },
  "hero.subtitle": {
    section: "hero",
    label: "Intro",
    default:
      "Bringing ideas to life through code. From dynamic backends to captivating frontends, I build seamless web and mobile solutions that inspire and perform.",
  },
  "hero.cta": { section: "hero", label: "Button", default: "Explore My Work" },
  "about.heading": { section: "about", label: "Heading", default: "About Me" },
  "about.intro": {
    section: "about",
    label: "Typed intro",
    default:
      "Hello! I'm Rahul Verma, a passionate and results-driven Full Stack Web Developer with 2+ years of experience building web applications.",
  },
  "about.skillsTitle": { section: "about", label: "Skills card title", default: "What I Do Best" },
  "about.whyTitle": { section: "about", label: "Second card title", default: "Why Me?" },
  "about.why": {
    section: "about",
    label: "Second card text",
    default:
      "I thrive on solving complex problems and turning ideas into reality with clean, maintainable code. I stay updated with the latest trends in technology to ensure the applications I build are future-ready. Whether it’s a single-page app or a full-fledged enterprise solution, I bring dedication, creativity, and attention to detail to every project.",
  },
  "work.heading": { section: "work", label: "Heading", default: "My Work" },
  "work.body": {
    section: "work",
    label: "Text",
    default:
      "I excel in crafting scalable, user-focused applications using cutting-edge technologies. With extensive experience in Node.js, React, and React Native, I have developed web and mobile solutions that emphasize both performance and functionality. By utilizing Tailwind CSS, I design responsive and visually captivating interfaces, ensuring a seamless user experience across platforms. My projects demonstrate proficiency in modern tools and frameworks, highlighting expertise in both frontend and backend development for robust, end-to-end solutions.",
  },
  "mobile.heading": { section: "mobile", label: "Heading", default: "Crafting Android & iOS Experiences" },
  "mobile.body": {
    section: "mobile",
    label: "Text",
    default:
      "As a developer proficient in React Native, I craft intuitive Android and iOS applications that deliver top-notch performance and user satisfaction. From ideation to deployment, I specialize in building cross-platform solutions with clean code, responsive designs, and a focus on usability. Let's shape the future of mobile experiences together!",
  },
  "projects.heading": { section: "projects", label: "Heading", default: "Projects" },
  "projects.subtitle": { section: "projects", label: "Subtitle", default: "A few products I've helped build" },
  "projects.cta": { section: "projects", label: "Button", default: "View all projects →" },
  "footer.name": { section: "footer", label: "Name", default: "Rahul Verma" },
  "footer.tagline": {
    section: "footer",
    label: "Tagline",
    default: "Full Stack Developer building web and mobile experiences.",
  },
  "footer.quickLinks": { section: "footer", label: "Links heading", default: "Quick Links" },
  "footer.connect": { section: "footer", label: "Social heading", default: "Let's Connect" },
  "footer.copyright": { section: "footer", label: "Copyright", default: "Rahul Verma. All Rights Reserved." },
} as const satisfies Record<string, { section: SectionId; label: string; default: string }>;
export type TextId = keyof typeof TEXTS;
export const TEXT_MAX_LENGTH = 1000;

// ---- validation ----

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const colorMap = z.object(
  Object.fromEntries(Object.keys(COLOR_TOKENS).map((k) => [k, hex.optional()])) as Record<
    ColorToken,
    z.ZodOptional<typeof hex>
  >
);

const sectionStyle = z.object({
  background: hex.optional(),
  heading: hex.optional(),
  text: hex.optional(),
  accent: hex.optional(),
  radius: z.number().min(0).max(64).optional(), // px
  shadow: z.enum(Object.keys(SHADOWS) as [ShadowId, ...ShadowId[]]).optional(),
  hidden: z.boolean().optional(),
});
export type SectionStyle = z.infer<typeof sectionStyle>;

export const customizationsSchema = z.object({
  version: z.literal(1),
  theme: z.object({
    light: colorMap,
    dark: colorMap,
    radius: z.number().min(0).max(1.5).optional(), // rem
    font: z.enum(Object.keys(FONTS) as [FontId, ...FontId[]]).optional(),
    fontSize: z.number().min(13).max(20).optional(), // px, scales all rem-based sizes
  }),
  sections: z.object(
    Object.fromEntries(Object.keys(SECTIONS).map((k) => [k, sectionStyle.optional()])) as Record<
      SectionId,
      z.ZodOptional<typeof sectionStyle>
    >
  ),
  text: z.object(
    Object.fromEntries(Object.keys(TEXTS).map((k) => [k, z.string().max(TEXT_MAX_LENGTH).optional()])) as Record<
      TextId,
      z.ZodOptional<z.ZodString>
    >
  ),
});
export type Customizations = z.infer<typeof customizationsSchema>;

export const emptyCustomizations = (): Customizations => ({
  version: 1,
  theme: { light: {}, dark: {} },
  sections: {},
  text: {},
});

/** Parses unknown data (localStorage, an imported file, later the server); null if invalid */
export const parseCustomizations = (data: unknown): Customizations | null => {
  const result = customizationsSchema.safeParse(data);
  return result.success ? result.data : null;
};

/** Layers settings: later layers win (defaults < site-wide < personal) */
export const mergeCustomizations = (...layers: (Customizations | null | undefined)[]): Customizations =>
  layers.reduce<Customizations>((merged, layer) => {
    if (!layer) return merged;
    const sections = { ...merged.sections };
    (Object.keys(layer.sections) as SectionId[]).forEach((id) => {
      sections[id] = { ...sections[id], ...layer.sections[id] };
    });
    return {
      version: 1,
      theme: {
        ...merged.theme,
        ...layer.theme,
        light: { ...merged.theme.light, ...layer.theme.light },
        dark: { ...merged.theme.dark, ...layer.theme.dark },
      },
      sections,
      text: { ...merged.text, ...layer.text },
    };
  }, emptyCustomizations());
