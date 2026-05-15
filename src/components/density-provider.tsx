"use client";

import * as React from "react";
import { MotionConfig } from "framer-motion";

export type Density = "comfortable" | "compact";
export type FontScale = "normal" | "large";
export type Accent = "default" | "ocean" | "forest" | "sunset" | "mono";

type AppearanceContextValue = {
  density: Density;
  setDensity: (d: Density) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;
  fontScale: FontScale;
  setFontScale: (s: FontScale) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
};

export const DensityContext = React.createContext<AppearanceContextValue>({
  density: "comfortable",
  setDensity: () => {},
  reducedMotion: false,
  setReducedMotion: () => {},
  fontScale: "normal",
  setFontScale: () => {},
  accent: "default",
  setAccent: () => {},
});

export function useDensity() {
  return React.useContext(DensityContext);
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = React.useState<Density>("comfortable");
  const [reducedMotion, setReducedMotionState] = React.useState(false);
  const [fontScale, setFontScaleState] = React.useState<FontScale>("normal");
  const [accent, setAccentState] = React.useState<Accent>("default");

  React.useEffect(() => {
    const d = localStorage.getItem("etm-density") as Density | null;
    const rm = localStorage.getItem("etm-reduced-motion") === "true";
    const fs = localStorage.getItem("etm-font-scale") as FontScale | null;
    const ac = localStorage.getItem("etm-accent") as Accent | null;
    if (d === "compact" || d === "comfortable") setDensityState(d);
    setReducedMotionState(rm);
    if (fs === "large" || fs === "normal") setFontScaleState(fs);
    const validAccents: Accent[] = ["default", "ocean", "forest", "sunset", "mono"];
    if (ac && validAccents.includes(ac)) setAccentState(ac);
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  React.useEffect(() => {
    if (reducedMotion) {
      document.documentElement.dataset.reducedMotion = "true";
    } else {
      delete document.documentElement.dataset.reducedMotion;
    }
  }, [reducedMotion]);

  React.useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
  }, [fontScale]);

  React.useEffect(() => {
    document.documentElement.dataset.accent = accent;
  }, [accent]);

  function setDensity(d: Density) {
    setDensityState(d);
    localStorage.setItem("etm-density", d);
  }

  function setReducedMotion(v: boolean) {
    setReducedMotionState(v);
    localStorage.setItem("etm-reduced-motion", String(v));
  }

  function setFontScale(s: FontScale) {
    setFontScaleState(s);
    localStorage.setItem("etm-font-scale", s);
  }

  function setAccent(a: Accent) {
    setAccentState(a);
    localStorage.setItem("etm-accent", a);
  }

  return (
    <DensityContext.Provider value={{ density, setDensity, reducedMotion, setReducedMotion, fontScale, setFontScale, accent, setAccent }}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </DensityContext.Provider>
  );
}
