"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OPEN_PALETTE_EVENT } from "./palette-event";

const Cursor = dynamic(() => import("@/components/fx/Cursor").then((m) => m.Cursor), { ssr: false });
const CommandPalette = dynamic(() => import("./CommandPalette").then((m) => m.CommandPalette), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

/**
 * Non-critical chrome, loaded after the page is interactive:
 *  - custom cursor: only on fine pointers (never shipped to phones)
 *  - command palette: on idle, or immediately on the first ⌘K / button press
 */
export function DeferredExtras() {
  const [cursor, setCursor] = useState(false);
  const [palette, setPalette] = useState(false);
  const [openOnMount, setOpenOnMount] = useState(false);

  useEffect(() => {
    const w = window as IdleWindow;
    const load = () => {
      setPalette(true);
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setCursor(true);
    };
    const id = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 3000 }) : window.setTimeout(load, 1500);

    const early = (e: Event) => {
      if (e instanceof KeyboardEvent && !((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) return;
      // Once mounted, the palette owns the shortcut; this only covers the first press.
      e.preventDefault();
      setOpenOnMount(true);
      setPalette(true);
    };
    window.addEventListener("keydown", early);
    window.addEventListener(OPEN_PALETTE_EVENT, early);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
      window.removeEventListener("keydown", early);
      window.removeEventListener(OPEN_PALETTE_EVENT, early);
    };
  }, []);

  return (
    <>
      {cursor && <Cursor />}
      {palette && <CommandPalette initialOpen={openOnMount} />}
    </>
  );
}
