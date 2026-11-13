"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TEXTS, emptyCustomizations, mergeCustomizations, parseCustomizations, type Customizations, type TextId } from "./schema";
import { themeCss } from "./theme-css";
import { CSS_STORAGE_KEY, PREPAINT_STYLE_ID } from "./prepaint";

export const STORAGE_KEY = "site-customizations";

/** Messages the /customize dashboard sends to its live-preview frame */
export type PreviewMessage =
  | { type: "customizer:draft"; config: unknown }
  | { type: "customizer:mode"; mode: "light" | "dark" }
  | { type: "customizer:focus"; section: string };

interface CustomizerContextValue {
  /** Effective settings: defaults < site-wide (admin, later) < this visitor's saved changes */
  config: Customizations;
  /** This visitor's saved changes */
  personal: Customizations;
  loaded: boolean;
  text: (id: TextId) => string;
  /** Saves new personal settings; they apply everywhere immediately, including other tabs */
  save: (next: Customizations) => void;
}

const defaults = emptyCustomizations();

// Works without a provider too: components just render their defaults
const CustomizerContext = createContext<CustomizerContextValue>({
  config: defaults,
  personal: defaults,
  loaded: false,
  text: (id) => TEXTS[id].default,
  save: () => undefined,
});

export const useCustomizer = () => useContext(CustomizerContext);

const readSaved = (): Customizations | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? parseCustomizations(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
};

export function CustomizerProvider({
  children,
  siteWide = null,
}: {
  children: ReactNode;
  /** Admin-published settings for everyone (phase 2); visitors' own changes still win */
  siteWide?: Customizations | null;
}) {
  const [personal, setPersonal] = useState<Customizations>(defaults);
  const [loaded, setLoaded] = useState(false);
  // Inside the dashboard's preview frame: shows unsaved drafts and never writes to storage
  const [isPreview, setIsPreview] = useState(false);
  const [draft, setDraft] = useState<Customizations | null>(null);

  useEffect(() => {
    setIsPreview(window.self !== window.top);
    const saved = readSaved();
    if (saved) setPersonal(saved);
    setLoaded(true);

    // Saving in another tab (e.g. the dashboard) updates this one live
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setPersonal(readSaved() ?? emptyCustomizations());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Preview frame: listen to the dashboard (same origin only)
  useEffect(() => {
    if (!isPreview) return;
    const onMessage = (e: MessageEvent<PreviewMessage>) => {
      if (e.origin !== window.location.origin || typeof e.data !== "object" || !e.data) return;
      const message = e.data;
      if (message.type === "customizer:draft") {
        setDraft(parseCustomizations(message.config));
      } else if (message.type === "customizer:mode") {
        document.documentElement.classList.toggle("dark", message.mode === "dark");
      } else if (message.type === "customizer:focus") {
        const el = document.querySelector<HTMLElement>(`[data-section="${CSS.escape(message.section)}"]`);
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.animate([{ outline: "3px solid rgb(56 189 248)" }, { outline: "3px solid transparent" }], {
          duration: 1400,
        });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "customizer:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, [isPreview]);

  const config = useMemo(
    () => mergeCustomizations(siteWide, isPreview && draft ? draft : personal),
    [siteWide, personal, draft, isPreview]
  );
  const css = useMemo(() => themeCss(config), [config]);

  // Once React has applied the styles, drop the pre-paint copy and keep the CSS for the next visit
  useEffect(() => {
    if (!loaded) return;
    document.getElementById(PREPAINT_STYLE_ID)?.remove();
    if (isPreview) return;
    try {
      if (css) window.localStorage.setItem(CSS_STORAGE_KEY, css);
      else window.localStorage.removeItem(CSS_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [css, loaded, isPreview]);

  const save = useCallback((next: Customizations) => {
    setPersonal(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.localStorage.setItem(CSS_STORAGE_KEY, themeCss(next));
    } catch {
      // storage full or blocked: changes still apply for this visit
    }
  }, []);

  const value = useMemo<CustomizerContextValue>(
    () => ({
      config,
      personal,
      loaded,
      text: (id) => config.text[id] || TEXTS[id].default,
      save,
    }),
    [config, personal, loaded, save]
  );

  return (
    <CustomizerContext.Provider value={value}>
      <style data-customizer dangerouslySetInnerHTML={{ __html: css }} />
      {children}
    </CustomizerContext.Provider>
  );
}
