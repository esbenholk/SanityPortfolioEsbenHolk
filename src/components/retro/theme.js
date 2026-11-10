import { useContext, useEffect, useState } from "react";
import AppContext from "../../globalState";

// desktopOnly skins fall back to the storefront on phones and tablets.
// `address`: visiting a matching URL switches to that skin (and then lands on the home page).
// The number of repeated letters doesn't matter: /aaah and /aaaaaaaaaaaaah both work.
export const THEMES = [
  {
    id: "storefront",
    label: "I MISS THE INTERNET",
    address: /^\/a{3,}h+\/?$/i,
  },
  { id: "tube", label: "TUBE", address: /^\/u{3,}g*h+\/?$/i },
  {
    id: "ocean",
    label: "OCEAN",
    desktopOnly: true,
    address: /^\/m{3,}\/?$/i,
  },
  {
    id: "minimal",
    label: "MINIMAL",
    address: /^\/esbenholk-is-a-serious-artist\/?$/i,
  },
  { id: "texture", label: "TEXTURED" },
];

// The skin whose secret address this is, if any
export const themeForAddress = (pathname) =>
  THEMES.find((option) => option.address && option.address.test(pathname));

const DESKTOP_QUERY = "(min-width: 900px) and (pointer: fine)";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export const useIsDesktop = () => useMediaQuery(DESKTOP_QUERY);

// The skin actually shown: a desktop-only skin isn't used on small or touch screens
export function effectiveTheme(theme, isDesktop) {
  const option = THEMES.find((item) => item.id === theme);
  if (!option || (option.desktopOnly && !isDesktop)) return "storefront";
  return theme;
}

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
    ads: [
      "HOT NEW UPLOADS DAILY",
      "MODELS IN YOUR AREA",
      "FREE CHAOS — NO SIGNUP",
    ],
    adSub: "100% FREE",
    equip: "CATEGORIES",
    feature: "NOW PLAYING",
    enter: "WATCH NOW",
    wall: "TRENDING NOW 🔥",
    mega: "NEW UPLOADS EVERY DAY",
  },
  ocean: {
    ads: ["DRIFT THROUGH THE WORK", "STILL WATER", "SAIL ON"],
    adSub: "slowly",
    equip: "CURRENTS",
    feature: "ON THE HORIZON",
    enter: "SET SAIL",
    wall: "",
    mega: "THE SEA KEEPS EVERYTHING",
  },
  minimal: {
    ads: ["", "", ""],
    adSub: "",
    equip: "",
    feature: "",
    enter: "",
    wall: "",
    mega: "",
  },
};

// Slogans for the footer strip and tickers; one is picked at random per page
export const SLOGANS = {
  storefront: [
    "EVERYTHING MUST GO",
    "ALL STOCK MUST GO",
    "FREE SHIPPING TO THE VOID",
    "NO REFUNDS NO REGRETS",
    "LIMITED EDITION FOREVER",
    "BUY 1 GET CHAOS FREE",
    "CLOSING DOWN SINCE 2004",
    "PRICES SLASHED TO ZERO",
    "NOW WITH 100% MORE INTERNET",
    "YOUR CART MISSES YOU",
    "ONE CLICK FROM PARADISE",
    "WHILE SUPPLIES LAST",
  ],
  tube: [
    "NEW UPLOADS EVERY DAY",
    "HOT WORKS IN YOUR AREA",
    "YOU WON'T BELIEVE #7",
    "100% FREE — NO SIGNUP",
    "TRENDING IN THE ARCHIVE",
    "WATCH UNTIL THE END",
    "THE ALGORITHM LOVES YOU",
    "SKIP AD IN 5",
    "VERIFIED CHAOS",
  ],
  ocean: [
    "the sea keeps everything",
    "drift a little longer",
    "every wave is an archive",
    "slow water, slow work",
    "nothing here is in a hurry",
    "listen to the tide",
    "float until it makes sense",
    "the horizon is a promise",
  ],
  minimal: ["Selected works", "Work in progress", "All works"],
};

export const randomSlogan = (theme) => {
  const list = SLOGANS[theme] || SLOGANS.storefront;
  return list[Math.floor(Math.random() * list.length)];
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
