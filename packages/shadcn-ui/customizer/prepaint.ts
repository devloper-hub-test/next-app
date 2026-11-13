// customizer/prepaint.ts — shared by the server layout and the client provider (no "use client")

/** Last generated customization CSS, kept so it can be applied before first paint */
export const CSS_STORAGE_KEY = "site-customizations-css";
export const PREPAINT_STYLE_ID = "customizer-prepaint";

/** Inline in <head>: re-applies the visitor's saved look before the page is drawn, avoiding a flash */
export const PREPAINT_SCRIPT = `try{var c=localStorage.getItem("${CSS_STORAGE_KEY}");if(c){var s=document.createElement("style");s.id="${PREPAINT_STYLE_ID}";s.textContent=c;document.head.appendChild(s)}}catch(e){}`;
