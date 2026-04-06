"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  const [resolvedTheme, setResolvedTheme] = React.useState<Theme>("dark");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("theme") as Theme | null;
    const nextTheme = stored === "light" || stored === "dark"
      ? stored
      : getSystemTheme();

    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    setResolvedTheme(nextTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = window.localStorage.getItem("theme");
      if (current === "light" || current === "dark") return;

      const systemTheme = getSystemTheme();
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      setResolvedTheme(systemTheme);
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setTheme = React.useCallback((theme: Theme) => {
    window.localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    setResolvedTheme(theme);
  }, []);

  return (
    <ThemeContext.Provider value={{ resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
