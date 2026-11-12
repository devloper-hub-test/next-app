// customizer/theme-css.ts — turns validated settings into CSS (no "use client": usable on the server too)
import { contrastingForeground, hexToHslVar } from "./color";
import { COLOR_TOKENS, FONTS, SHADOWS, type ColorToken, type Customizations, type SectionId } from "./schema";

/** Builds the CSS that applies theme settings. Inputs are validated, so values are always safe. */
export function themeCss(config: Customizations): string {
  const vars = (colors: Customizations["theme"]["light"]) =>
    (Object.keys(COLOR_TOKENS) as ColorToken[])
      .flatMap((token) => {
        const hex = colors[token];
        if (!hex) return [];
        const lines = [`${COLOR_TOKENS[token].cssVar}: ${hexToHslVar(hex)};`];
        if (token === "brand") {
          const [h, s, l] = hexToHslVar(hex).split(" ");
          lines.push(`--brand-strong: ${h} ${s} ${Math.round(parseFloat(l) * 0.75)}%;`);
        }
        if (token === "primary") lines.push(`--primary-foreground: ${contrastingForeground(hex)};`);
        if (token === "card") lines.push(`--popover: ${hexToHslVar(hex)};`);
        if (token === "border") lines.push(`--input: ${hexToHslVar(hex)};`);
        return lines;
      })
      .join(" ");

  const { theme } = config;
  const rules: string[] = [];
  // Higher specificity than the defaults in globals.css (:root / .dark)
  const light = vars(theme.light);
  const dark = vars(theme.dark);
  if (light) rules.push(`html:root:not(.dark) { ${light} }`);
  if (dark) rules.push(`html.dark:root { ${dark} }`);
  const shared = [
    theme.radius !== undefined ? `--radius: ${theme.radius}rem;` : "",
    theme.fontSize !== undefined ? `font-size: ${theme.fontSize}px;` : "",
  ].join(" ");
  if (shared.trim()) rules.push(`html:root { ${shared} }`);
  if (theme.font && FONTS[theme.font].stack) rules.push(`body { font-family: ${FONTS[theme.font].stack} !important; }`);

  // Sections mark themselves with data-section, and their parts with data-role
  (Object.keys(config.sections) as SectionId[]).forEach((id) => {
    const s = config.sections[id];
    if (!s) return;
    const sel = `[data-section="${id}"]`;
    const role = (name: string) => `${sel} [data-role~="${name}"]`;
    if (s.hidden) rules.push(`${sel} { display: none !important; }`);
    const root = [
      s.background ? `background-color: ${s.background} !important;` : "",
      s.radius !== undefined ? `border-radius: ${s.radius}px !important;` : "",
      s.shadow ? `box-shadow: ${SHADOWS[s.shadow]} !important;` : "",
      s.text ? `color: ${s.text} !important;` : "",
    ].join(" ");
    if (root.trim()) rules.push(`${sel} { ${root} }`);
    if (s.heading) rules.push(`${role("heading")} { color: ${s.heading} !important; }`);
    if (s.text) rules.push(`${role("text")} { color: ${s.text} !important; }`);
    if (s.accent) {
      rules.push(`${role("accent")} { color: ${s.accent} !important; border-color: ${s.accent} !important; }`);
      rules.push(
        `${role("accent-bg")} { background-color: ${s.accent} !important; color: hsl(${contrastingForeground(s.accent)}) !important; }`
      );
      rules.push(`${role("cta")} button { --bg: ${s.accent} !important; }`);
    }
  });
  return rules.join("\n");
}
