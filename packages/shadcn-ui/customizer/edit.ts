// customizer/edit.ts — pure helpers that return an updated copy of a Customizations draft
import { TEXTS, TEXT_MAX_LENGTH, type ColorToken, type Customizations, type SectionId, type SectionStyle, type TextId } from "./schema";

export type ColorMode = "light" | "dark";
type ThemePatch = Partial<Pick<Customizations["theme"], "radius" | "font" | "fontSize">>;

export const withColor = (c: Customizations, mode: ColorMode, token: ColorToken, hex: string | undefined): Customizations => ({
  ...c,
  theme: { ...c.theme, [mode]: { ...c.theme[mode], [token]: hex } },
});

export const withTheme = (c: Customizations, patch: ThemePatch): Customizations => ({
  ...c,
  theme: { ...c.theme, ...patch },
});

/** Merges a patch into a section's style; null resets the section */
export const withSection = (c: Customizations, id: SectionId, patch: Partial<SectionStyle> | null): Customizations => ({
  ...c,
  sections: { ...c.sections, [id]: patch ? { ...c.sections[id], ...patch } : undefined },
});

/** Stores custom text; blank or default text resets it */
export const withText = (c: Customizations, id: TextId, value: string | undefined): Customizations => {
  const clean = value?.replace(/\s+/g, " ").trim();
  return {
    ...c,
    text: { ...c.text, [id]: clean && clean !== TEXTS[id].default ? clean.slice(0, TEXT_MAX_LENGTH) : undefined },
  };
};

/** Resets a section's style and all of its text */
export const withoutSection = (c: Customizations, id: SectionId): Customizations => {
  const text = { ...c.text };
  (Object.keys(TEXTS) as TextId[]).forEach((key) => {
    if (TEXTS[key].section === id) delete text[key];
  });
  return { ...withSection(c, id, null), text };
};

/** Equality that ignores unset (undefined) fields */
export const sameCustomizations = (a: Customizations, b: Customizations) => JSON.stringify(a) === JSON.stringify(b);
