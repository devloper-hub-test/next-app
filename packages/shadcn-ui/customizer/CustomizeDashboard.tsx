"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Download,
  ExternalLink,
  LayoutTemplate,
  Monitor,
  Moon,
  Paintbrush,
  PanelBottom,
  PanelTop,
  RotateCcw,
  Smartphone,
  Sun,
  Upload,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { cn } from "../lib/utils";
import { useCustomizer, type PreviewMessage } from "./CustomizerProvider";
import { withColor, withSection, withText, withTheme, withoutSection, sameCustomizations, type ColorMode } from "./edit";
import {
  COLOR_TOKENS,
  DEFAULT_COLORS,
  FONTS,
  SECTIONS,
  SHADOWS,
  TEXTS,
  TEXT_MAX_LENGTH,
  emptyCustomizations,
  parseCustomizations,
  type ColorToken,
  type Customizations,
  type FontId,
  type SectionId,
  type ShadowId,
  type TextId,
} from "./schema";

type Item = "theme" | SectionId;

const GROUPS: { title: string; items: Item[] }[] = [
  { title: "Site-wide", items: ["theme", "header", "footer"] },
  { title: "Home page", items: ["hero", "about", "work", "mobile", "projects"] },
];

const ITEM_ICONS: Partial<Record<Item, ReactNode>> = {
  theme: <Paintbrush className="h-4 w-4" />,
  header: <PanelTop className="h-4 w-4" />,
  footer: <PanelBottom className="h-4 w-4" />,
};

const itemLabel = (item: Item) => (item === "theme" ? "Theme" : SECTIONS[item].label);

const PREVIEW_PAGES = [
  { path: "/", label: "Home" },
  { path: "/games", label: "Games" },
  { path: "/learn", label: "Learn" },
  { path: "/blog", label: "Blog" },
];

// One-click colour themes: accent + button colour per mode
const PRESETS: { name: string; swatch: string; light?: Partial<Record<ColorToken, string>>; dark?: Partial<Record<ColorToken, string>> }[] = [
  { name: "Default", swatch: "#4DB6AC" },
  { name: "Ocean", swatch: "#0ea5e9", light: { brand: "#0ea5e9", primary: "#0369a1" }, dark: { brand: "#38bdf8", primary: "#38bdf8" } },
  { name: "Sunset", swatch: "#f97316", light: { brand: "#f97316", primary: "#c2410c" }, dark: { brand: "#fb923c", primary: "#fb923c" } },
  { name: "Forest", swatch: "#22c55e", light: { brand: "#16a34a", primary: "#166534" }, dark: { brand: "#4ade80", primary: "#4ade80" } },
  { name: "Grape", swatch: "#a855f7", light: { brand: "#a855f7", primary: "#7e22ce" }, dark: { brand: "#c084fc", primary: "#c084fc" } },
  { name: "Rose", swatch: "#f43f5e", light: { brand: "#f43f5e", primary: "#be123c" }, dark: { brand: "#fb7185", primary: "#fb7185" } },
];

const hasChanges = (draft: Customizations, item: Item) =>
  item === "theme"
    ? Object.keys(draft.theme.light).some((k) => draft.theme.light[k as ColorToken]) ||
      Object.keys(draft.theme.dark).some((k) => draft.theme.dark[k as ColorToken]) ||
      draft.theme.radius !== undefined ||
      draft.theme.font !== undefined ||
      draft.theme.fontSize !== undefined
    : Boolean(draft.sections[item]) ||
      (Object.keys(TEXTS) as TextId[]).some((id) => TEXTS[id].section === item && draft.text[id]);

// ---------- small building blocks ----------

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border bg-background p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

function ColorRow({
  label,
  hint,
  value,
  fallback,
  onChange,
}: {
  label: string;
  hint?: string;
  value?: string;
  fallback: string;
  onChange: (hex: string | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        aria-label={label}
        value={value ?? fallback}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{label}</p>
        {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
      </div>
      {value ? (
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onChange(undefined)}>
          Reset
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">default</span>
      )}
    </div>
  );
}

/** Text field that keeps what you type (spaces included) while live-updating the draft */
function TextField({ id, saved, onChange }: { id: TextId; saved?: string; onChange: (value: string) => void }) {
  const [value, setValue] = useState(saved ?? "");
  const long = TEXTS[id].default.length > 60;
  const props = {
    value,
    placeholder: TEXTS[id].default,
    maxLength: TEXT_MAX_LENGTH,
    className: "text-sm",
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
      onChange(e.target.value);
    },
  };
  return (
    <label className="block space-y-1">
      <span className="flex items-center justify-between text-xs font-medium">
        {TEXTS[id].label}
        {saved && (
          <button
            type="button"
            className="text-muted-foreground hover:underline"
            onClick={() => {
              setValue("");
              onChange("");
            }}
          >
            use default
          </button>
        )}
      </span>
      {long ? <Textarea rows={4} {...props} /> : <Input {...props} />}
    </label>
  );
}

// ---------- editors ----------

function ThemeEditor({
  draft,
  setDraft,
  mode,
}: {
  draft: Customizations;
  setDraft: (next: Customizations) => void;
  mode: ColorMode;
}) {
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    const theme = { ...draft.theme };
    (["light", "dark"] as ColorMode[]).forEach((m) => {
      const { brand: _brand, primary: _primary, ...rest } = theme[m];
      theme[m] = { ...rest, ...(m === "light" ? preset.light : preset.dark) };
    });
    setDraft({ ...draft, theme });
  };

  return (
    <div className="space-y-4">
      <Group title="Quick themes">
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 rounded-lg border p-2 text-left text-xs font-medium transition hover:bg-muted"
            >
              <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: preset.swatch }} />
              {preset.name}
            </button>
          ))}
        </div>
      </Group>

      <Group title={`Colours · ${mode} mode`}>
        <p className="-mt-1 text-xs text-muted-foreground">
          Light and dark mode have their own colours. Switch with the ☀️/🌙 toggle above the preview.
        </p>
        {(Object.keys(COLOR_TOKENS) as ColorToken[]).map((token) => (
          <ColorRow
            key={token}
            label={COLOR_TOKENS[token].label}
            hint={COLOR_TOKENS[token].hint}
            value={draft.theme[mode][token]}
            fallback={DEFAULT_COLORS[mode][token]}
            onChange={(hex) => setDraft(withColor(draft, mode, token, hex))}
          />
        ))}
      </Group>

      <Group title="Shape & type">
        <div className="space-y-2">
          <p className="text-sm font-medium">Corner roundness · {(draft.theme.radius ?? 0.5).toFixed(2)}rem</p>
          <Slider
            min={0}
            max={1.5}
            step={0.125}
            value={[draft.theme.radius ?? 0.5]}
            onValueChange={([radius]) => setDraft(withTheme(draft, { radius }))}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Text size · {draft.theme.fontSize ?? 16}px</p>
          <Slider
            min={13}
            max={20}
            step={1}
            value={[draft.theme.fontSize ?? 16]}
            onValueChange={([fontSize]) => setDraft(withTheme(draft, { fontSize }))}
          />
        </div>
        <label className="block space-y-2">
          <span className="text-sm font-medium">Font</span>
          <select
            value={draft.theme.font ?? "default"}
            onChange={(e) => setDraft(withTheme(draft, { font: e.target.value as FontId }))}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm"
          >
            {(Object.keys(FONTS) as FontId[]).map((font) => (
              <option key={font} value={font}>
                {FONTS[font].label}
              </option>
            ))}
          </select>
        </label>
      </Group>
    </div>
  );
}

function SectionEditor({
  id,
  draft,
  setDraft,
  version,
}: {
  id: SectionId;
  draft: Customizations;
  setDraft: (next: Customizations) => void;
  version: number;
}) {
  const style = draft.sections[id] ?? {};
  const texts = (Object.keys(TEXTS) as TextId[]).filter((key) => TEXTS[key].section === id);
  const set = (patch: Parameters<typeof withSection>[2]) => setDraft(withSection(draft, id, patch));

  return (
    <div className="space-y-4">
      {SECTIONS[id].canHide && (
        <div className="flex items-center justify-between rounded-xl border bg-background p-4">
          <div>
            <p className="text-sm font-medium">Show this section</p>
            <p className="text-xs text-muted-foreground">Hidden sections disappear from the page.</p>
          </div>
          <Switch checked={!style.hidden} onCheckedChange={(on) => set({ hidden: !on || undefined })} />
        </div>
      )}

      {texts.length > 0 && (
        <Group title="Content">
          {texts.map((textId) => (
            <TextField
              // Re-mount when the draft is replaced (discard, reset, import)
              key={`${textId}:${version}`}
              id={textId}
              saved={draft.text[textId]}
              onChange={(value) => setDraft(withText(draft, textId, value))}
            />
          ))}
        </Group>
      )}

      <Group title="Colours">
        <ColorRow label="Background" value={style.background} fallback="#ffffff" onChange={(background) => set({ background })} />
        <ColorRow label="Headings" value={style.heading} fallback="#111111" onChange={(heading) => set({ heading })} />
        <ColorRow label="Body text" value={style.text} fallback="#555555" onChange={(text) => set({ text })} />
        <ColorRow label="Accent" hint="Badges, buttons, underlines" value={style.accent} fallback="#4db6ac" onChange={(accent) => set({ accent })} />
      </Group>

      <Group title="Shape">
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Corner roundness · {style.radius !== undefined ? `${style.radius}px` : "default"}
          </p>
          <Slider min={0} max={64} step={2} value={[style.radius ?? 16]} onValueChange={([radius]) => set({ radius })} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Shadow</p>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(SHADOWS) as ShadowId[]).map((shadow) => (
              <Button
                key={shadow}
                size="sm"
                variant={style.shadow === shadow ? "default" : "outline"}
                className="h-8 px-0 text-xs"
                onClick={() => set({ shadow })}
              >
                {shadow}
              </Button>
            ))}
          </div>
        </div>
      </Group>
    </div>
  );
}

// ---------- dashboard ----------

/** The /customize page: pick a page section, edit its content and look, preview live, then save */
export function CustomizeDashboard() {
  const { personal, loaded, save } = useCustomizer();
  const [draft, setDraftState] = useState<Customizations>(personal);
  const [version, setVersion] = useState(0); // bumps when the whole draft is replaced
  const [selected, setSelected] = useState<Item>("theme");
  const [mode, setMode] = useState<ColorMode>("light");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewPath, setPreviewPath] = useState("/");
  const [justSaved, setJustSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const started = useRef(false);

  const setDraft = (next: Customizations) => setDraftState(next);
  const replaceDraft = (next: Customizations) => {
    setDraftState(next);
    setVersion((v) => v + 1);
  };

  // Start from the saved settings once they've loaded
  useEffect(() => {
    if (loaded && !started.current) {
      started.current = true;
      replaceDraft(personal);
    }
  }, [loaded, personal]);

  useEffect(() => {
    setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const dirty = loaded && !sameCustomizations(draft, personal);

  // ----- live preview -----
  const post = useCallback((message: PreviewMessage) => {
    iframeRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  useEffect(() => post({ type: "customizer:draft", config: draft }), [draft, post]);
  useEffect(() => post({ type: "customizer:mode", mode }), [mode, post]);
  useEffect(() => {
    if (selected !== "theme") post({ type: "customizer:focus", section: selected });
  }, [selected, post]);

  // A (re)loaded preview page announces itself; bring it up to date
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "customizer:ready") return;
      post({ type: "customizer:draft", config: draft });
      post({ type: "customizer:mode", mode });
      if (selected !== "theme") post({ type: "customizer:focus", section: selected });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [draft, mode, selected, post]);

  // ----- saving -----
  const onSave = () => {
    save(draft);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  // Ctrl/Cmd+S saves; warn before leaving with unsaved changes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) onSave();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  });

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(null), 2500);
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "site-customizations.json" }).click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = parseCustomizations(JSON.parse(await file.text()));
      if (!parsed) throw new Error("invalid");
      replaceDraft(parsed);
      flash("Imported. Review it, then Save.");
    } catch {
      flash("That file isn't a valid customization export.");
    }
  };

  const selectItem = (item: Item) => setSelected(item);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-muted/40 text-foreground">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" href="/">
            <ArrowLeft className="h-4 w-4" /> Site
          </Link>
          <span className="h-5 w-px bg-border" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold">
              <LayoutTemplate className="h-4 w-4 text-brand" /> Customize
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Only you see these changes. They&apos;re saved in this browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline" aria-live="polite">
            {justSaved ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="h-3.5 w-3.5" /> Saved, now live on the site
              </span>
            ) : dirty ? (
              "Unsaved changes"
            ) : (
              "All changes saved"
            )}
          </span>
          <Button variant="outline" size="sm" disabled={!dirty} onClick={() => replaceDraft(personal)}>
            Discard
          </Button>
          <Button size="sm" disabled={!dirty} onClick={onSave} title="Save (Ctrl/Cmd+S)">
            Save
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[13rem_24rem_minmax(0,1fr)]">
        {/* Pages and sections */}
        <nav className="border-b bg-background p-3 lg:border-b-0 lg:border-r" aria-label="What to customize">
          <select
            aria-label="Section"
            value={selected}
            onChange={(e) => selectItem(e.target.value as Item)}
            className="h-9 w-full rounded-md border bg-background px-2 text-sm lg:hidden"
          >
            {GROUPS.flatMap((group) => group.items).map((item) => (
              <option key={item} value={item}>
                {itemLabel(item)}
              </option>
            ))}
          </select>
          <div className="hidden space-y-5 lg:block">
            {GROUPS.map((group) => (
              <div key={group.title}>
                <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => selectItem(item)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                          selected === item ? "bg-muted font-semibold" : "hover:bg-muted/60"
                        )}
                      >
                        {ITEM_ICONS[item] ?? <LayoutTemplate className="h-4 w-4 opacity-60" />}
                        <span className="flex-1 truncate">{itemLabel(item)}</span>
                        {hasChanges(draft, item) && (
                          <span className="h-2 w-2 rounded-full bg-brand" title="Customized" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Editor */}
        <div className="flex min-h-0 flex-col border-r">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="text-lg font-bold">{itemLabel(selected)}</h1>
                <p className="text-xs text-muted-foreground">
                  {selected === "theme"
                    ? "Colours, corners and fonts for every page."
                    : "Change the words and the look of this section."}
                </p>
              </div>
              {hasChanges(draft, selected) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    replaceDraft(
                      selected === "theme"
                        ? { ...draft, theme: emptyCustomizations().theme }
                        : withoutSection(draft, selected)
                    )
                  }
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
                </Button>
              )}
            </div>
            {selected === "theme" ? (
              <ThemeEditor draft={draft} setDraft={setDraft} mode={mode} />
            ) : (
              <SectionEditor id={selected} draft={draft} setDraft={setDraft} version={version} />
            )}
          </div>
          <div className="space-y-2 border-t bg-background p-3">
            {message && <p className="text-center text-xs font-medium text-brand-strong">{message}</p>}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" onClick={exportFile}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-600"
                onClick={() => {
                  if (window.confirm("Start over from the default look? (You can still Discard before saving.)")) {
                    replaceDraft(emptyCustomizations());
                  }
                }}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset all
              </Button>
            </div>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={importFile} />
          </div>
        </div>

        {/* Live preview */}
        <div className="hidden min-h-0 flex-col lg:flex">
          <div className="flex items-center justify-between gap-2 border-b bg-background px-3 py-2">
            <select
              aria-label="Preview page"
              value={previewPath}
              onChange={(e) => setPreviewPath(e.target.value)}
              className="h-8 rounded-md border bg-background px-2 text-sm"
            >
              {PREVIEW_PAGES.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.label}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <div className="flex rounded-lg border p-0.5" role="group" aria-label="Colour mode">
                {(["light", "dark"] as ColorMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    aria-label={`${m} mode`}
                    onClick={() => setMode(m)}
                    className={cn("rounded-md px-2 py-1", mode === m && "bg-muted")}
                  >
                    {m === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg border p-0.5" role="group" aria-label="Device">
                {(["desktop", "mobile"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={device === d}
                    aria-label={`${d} preview`}
                    onClick={() => setDevice(d)}
                    className={cn("rounded-md px-2 py-1", device === d && "bg-muted")}
                  >
                    {d === "desktop" ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <a
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                href={previewPath}
                rel="noreferrer"
                target="_blank"
                title="Open page in a new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-4">
            <iframe
              ref={iframeRef}
              src={previewPath}
              title="Live preview"
              className={cn(
                "h-full rounded-xl border bg-white shadow-lg transition-[width] duration-300",
                device === "desktop" ? "w-full" : "w-[390px]"
              )}
            />
          </div>
          <p className="border-t bg-background px-3 py-1.5 text-center text-xs text-muted-foreground">
            Preview shows your unsaved changes. Press Save to make them live.
          </p>
        </div>
      </div>
    </div>
  );
}
