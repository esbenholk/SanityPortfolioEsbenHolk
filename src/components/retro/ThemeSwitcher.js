import React from "react";
import { THEMES, useTheme } from "./theme";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switch" role="group" aria-label="Site skin">
      <span className="theme-switch__label">SKIN:</span>
      {THEMES.map((option) => (
        <button
          key={option.id}
          className={`theme-switch__btn ${theme === option.id ? "is-on" : ""}`}
          aria-pressed={theme === option.id}
          onClick={() => setTheme(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
