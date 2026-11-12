# Site Customizer

A small system that lets you change how the website **looks** (colours, fonts, corners, shadows) and what it **says** (headings, buttons, paragraphs) without touching code.

Right now, changes are **personal**: they're saved in your own browser, and nobody else sees them. Later, an admin version will publish changes for every visitor (see [What's next](#whats-next)).

---

## Quick start: using it

1. Open **`/customize`** on the site (for example `http://localhost:3000/customize`).
   There's no link to it anywhere; you have to type the address.
2. In the **left menu**, pick what to change:
   - **Site-wide:** Theme, Header, Footer
   - **Home page:** Hero, About me, My work, Mobile apps, Projects
3. Edit in the **middle panel**:
   - **Theme:** quick colour themes, 6 colours, corner roundness, text size, font
   - **A section:** show/hide it, change its text (**Content**), its **Colours**, and its **Shape**
4. Watch the **live preview** on the right. It updates as you type.
   - ☀️ / 🌙 switches the preview between light and dark mode (and chooses which theme colours you're editing)
   - 🖥 / 📱 switches between desktop and phone width
   - The dropdown previews other pages (Games, Learn, Blog)
5. Press **Save** (or Ctrl/Cmd + S). Your changes are now live on the site, even in tabs you already have open.

Other buttons:

| Button | What it does |
|---|---|
| **Discard** | Throws away unsaved edits and goes back to your last save |
| **Reset** (top of a section) | Puts that section back to the original look and text |
| **Reset all** | Starts over from the original site (you still need to Save) |
| **Export** | Downloads your design as a `.json` file |
| **Import** | Loads a design file you exported earlier (review it, then Save) |

> A dot (●) next to a menu item means you've customised it.

---

## How it works (the simple version)

### 1. Three layers of settings

Think of it as three transparent sheets stacked on top of each other. The top sheet wins wherever it says something.

```
   ┌─────────────────────────────────────┐
   │  Your personal changes   (browser)  │  ← wins
   ├─────────────────────────────────────┤
   │  Site-wide changes       (admin)    │  ← coming later
   ├─────────────────────────────────────┤
   │  Built-in defaults       (code)     │
   └─────────────────────────────────────┘
```

If you change only the Hero headline, everything else still comes from the defaults.

### 2. Draft → Save

Everything you do in `/customize` is a **draft** until you press **Save**.

- The **preview** shows your draft.
- The **real site** shows only what you've saved.
- If you try to leave with unsaved changes, the browser warns you.

### 3. Where your changes are stored

In your browser's local storage, under two keys:

| Key | What's in it |
|---|---|
| `site-customizations` | Your saved settings (colours, text, section styles) |
| `site-customizations-css` | A ready-made copy of the styles, used to show your look instantly on the next visit |

Clearing your browser data removes your customisations.

### 4. How colours reach the page

The site's components get their colours from a handful of **theme colours** (CSS variables) such as `--brand` (the teal accent), `--primary`, `--background`. Changing one of these recolours everything that uses it at once.

Sections are styled using **labels** in the HTML:

```html
<section data-section="hero">                    ← "this is the Hero section"
  <h1 data-role="heading">…</h1>                 ← "this is a heading"
  <p data-role="text">…</p>                      ← "this is body text"
  <a data-role="cta">…</a>                       ← "this is the main button"
</section>
```

The customizer turns your settings into CSS that targets those labels, for example *"headings inside the Hero are dark blue"*.

Available roles: `heading`, `text`, `accent` (text + border colour), `accent-bg` (background colour), `cta` (the shimmer button). An element can have more than one, e.g. `data-role="heading accent"`.

### 5. Text

Every editable piece of text has an **ID** and a **default**, for example:

```ts
"hero.cta": { section: "hero", label: "Button", default: "Explore My Work" }
```

Components show it with `<CustomText id="hero.cta" />`. If you've customised it you see your version; otherwise you see the default.

### 6. No flash of the old look

A tiny script in the page `<head>` re-applies your saved styles **before** the page is drawn, so you don't see the default look for a split second.
(Custom *text* can still appear a moment after load. The admin version will fix this by rendering text on the server.)

### 7. The live preview

The preview is the real site loaded inside a frame. The dashboard sends it your draft using browser messages (`postMessage`). The page inside the frame:

- shows the draft instead of your saved settings,
- **never saves anything**, so an unsaved draft can't leak onto the real site,
- only accepts messages from the same website.

---

## Safety rules

Settings come from places we don't fully control (browser storage, imported files, later the server), so everything is **checked before use** (with [zod](https://zod.dev)):

- Colours must be real hex colours like `#4db6ac`, so nobody can sneak in other CSS.
- Fonts and shadows must be one of the listed options.
- Text is limited to 1,000 characters and is always shown as **plain text**, never HTML.
- Unknown settings are thrown away.

If saved data is broken or invalid, it's ignored and the site uses its defaults.

---

## Files

All in `packages/shadcn-ui/customizer/`:

| File | What it's for |
|---|---|
| `schema.ts` | **The menu of options.** All colours, fonts, sections, shadows and editable texts (with defaults), plus the validation rules. Start here. |
| `CustomizerProvider.tsx` | Loads and saves your settings, combines the layers, applies the styles, keeps tabs in sync, and powers the preview frame. |
| `CustomizeDashboard.tsx` | The `/customize` page: menu, editors, live preview, Save/Discard. |
| `CustomText.tsx` | Shows a piece of customisable text. |
| `theme-css.ts` | Turns settings into CSS. |
| `edit.ts` | Small helpers that update a draft (set a colour, set text, reset a section…). |
| `color.ts` | Converts between colour formats. |
| `prepaint.ts` | The tiny "apply styles before paint" script. |

Elsewhere:

- `apps/web/src/app/layout.tsx` wraps every page in `<CustomizerProvider>` and adds the pre-paint script.
- `apps/web/src/app/customize/page.tsx` is the `/customize` route (hidden from search engines).
- `packages/shadcn-ui/app/globals.css` defines the default theme colours, including `--brand`.
- The home page components in `packages/shadcn-ui/my-uis/Home/` carry the `data-section` / `data-role` labels and use `<CustomText>`.

---

## Common tasks

### Make a new piece of text editable

1. Add it to `TEXTS` in `schema.ts`:
   ```ts
   "hero.note": { section: "hero", label: "Small note", default: "Available for freelance work" },
   ```
2. Use it in the component:
   ```tsx
   <CustomText id="hero.note" as="p" className="text-sm" role="text" />
   ```

That's it. It appears in the dashboard's **Content** list for that section automatically.

### Make a new section customisable

1. Add it to `SECTIONS` in `schema.ts`:
   ```ts
   contact: { label: "Contact", canHide: true },
   ```
2. Label it in the component:
   ```tsx
   <section data-section="contact">
     <h2 data-role="heading">…</h2>
     <p data-role="text">…</p>
   </section>
   ```
3. Add it to a group in `GROUPS` in `CustomizeDashboard.tsx` so it shows in the menu.

### Add a new theme colour

1. Add the CSS variable to `:root` and `.dark` in `packages/shadcn-ui/app/globals.css`.
2. Add it to `COLOR_TOKENS` and `DEFAULT_COLORS` in `schema.ts`.
3. Use it in components through a Tailwind colour (see `brand` in `packages/shadcn-ui/tailwind.config.ts`).

### Add a quick theme

Add an entry to `PRESETS` in `CustomizeDashboard.tsx` with its accent (`brand`) and button (`primary`) colours for light and dark mode.

> **Tip:** don't hard-code colours like `text-[#4DB6AC]` in components. Use theme colours such as `text-brand`, so the customizer can change them.

---

## Known limits

- Changes are per browser: they don't follow you to another device.
- Custom text can appear a split second after the page loads (styles don't, thanks to the pre-paint script).
- The animated beams in the "Mobile apps" section stay teal: they're SVG, which can't read theme colours.
- Only the Header, Footer and home page sections are customisable so far.

---

## What's next

**Admin mode (phase 2):** turn `/customize` into a locked admin dashboard where **Save** publishes the design for **every visitor**.

The groundwork is already in place:

- `CustomizerProvider` already accepts a `siteWide` layer (the middle sheet in the diagram above).
- `theme-css.ts` can run on the server, so site-wide styles *and text* can be rendered before the page reaches the visitor (no flash at all).

Still to do: an admin login, an API to save and load the site-wide settings, a database to store them (with version history so changes can be undone), and passing them into `CustomizerProvider`.
