import React from "react";
import { THEMES, isEmbedded, useIsDesktop, useTheme } from "./theme";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const isDesktop = useIsDesktop();
  // the site on the computer's screen can't change skin (it would show a computer in the computer)
  if (isEmbedded()) return null;

  return (
    <div className="theme-switch" role="group" aria-label="Site skin">
      <span className="theme-switch__label">SKIN:</span>
      {THEMES.filter((option) => isDesktop || !option.desktopOnly).map(
        (option) => (
          <button
            key={option.id}
            className={`theme-switch__btn ${theme === option.id ? "is-on" : ""}`}
            aria-pressed={theme === option.id}
            onClick={() => setTheme(option.id)}
          >
            {option.label}
          </button>
        ),
      )}
    </div>
  );
}
