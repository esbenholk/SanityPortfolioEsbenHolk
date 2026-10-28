import { useContext } from "react";
import AppContext from "../../globalState";

export const THEMES = [
  { id: "storefront", label: "STORE" },
  { id: "tube", label: "TUBE" },
  { id: "swamp", label: "SWAMP" },
];

// Labels that change with the skin; everything else is styled in themes.css
const COPY = {
  storefront: {
    ads: ["ALL PROJECTS NOW ON DISPLAY", "ESTUDIO Y MEMORIAS", "FREE CHAOS!!!"],
    adSub: "CLIC AQUÍ",
    equip: "EQUIP",
    feature: "FEATURE PRESENTATION",
    enter: "ENTER",
    wall: "",
    mega: "EVERYTHING MUST GO",
  },
  tube: {
    ads: ["HOT NEW UPLOADS DAILY", "MODELS IN YOUR AREA", "FREE CHAOS — NO SIGNUP"],
    adSub: "100% FREE",
    equip: "CATEGORIES",
    feature: "NOW PLAYING",
    enter: "WATCH NOW",
    wall: "TRENDING NOW 🔥",
    mega: "NEW UPLOADS EVERY DAY",
  },
  swamp: {
    ads: ["WANDER THE ARCHIVE", "WHISPERS & MEMORIES", "DESCEND INTO THE MIRE"],
    adSub: "follow the lights",
    equip: "GATHERINGS",
    feature: "THE STILL POOL",
    enter: "DESCEND",
    wall: "REFLECTIONS ON THE WATER",
    mega: "ALL THINGS RETURN TO THE BOG",
  },
};

export function useTheme() {
  const { theme = "storefront", setTheme } = useContext(AppContext);
  return { theme, setTheme, copy: COPY[theme] || COPY.storefront };
}

// Stable pseudo-random number per string, for fake views/durations
export function hashOf(text = "") {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}
