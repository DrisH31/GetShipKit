"use client";

import { useContext } from "react";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "./button";
import { ThemeContext } from "@/app/providers";

export function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  // Prevent hydration mismatch by only rendering the icon in the browser
  const mounted = useIsClient();

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Also update localStorage for persistence
    localStorage.setItem("theme", newTheme);
  };

  // If not mounted yet, render a placeholder with the same dimensions
  if (!mounted) {
    return (
      <div className="w-10 h-10"></div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="rounded-full"
    >
      {theme === "light" ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </Button>
  );
} 