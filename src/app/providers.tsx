'use client';

import { ReactNode, createContext, useCallback, useEffect, useState } from "react";

type Scheme = 'dark' | 'light';

interface ThemeContextType {
  theme: Scheme;
  setTheme: (theme: Scheme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

// The scheme the inline script in layout.tsx already applied before paint
// (saved choice, else the system's). Server render assumes light; the toggle's
// icon waits for the browser (useIsClient), so nothing mismatches.
function initialScheme(): Scheme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Scheme>(initialScheme);

  // Only an explicit choice is saved; until then the page follows the system.
  const setTheme = useCallback((next: Scheme) => {
    setThemeState(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.classList.toggle('light', next === 'light');
    root.style.colorScheme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // storage unavailable (private mode): the choice lasts for this page
    }
  }, []);

  // Until someone chooses, follow the system as it changes; and keep other tabs in step.
  useEffect(() => {
    const apply = (next: Scheme) => {
      setThemeState(next);
      const root = document.documentElement;
      root.classList.toggle('dark', next === 'dark');
      root.classList.toggle('light', next === 'light');
      root.style.colorScheme = next;
    };
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onSystem = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        // storage unavailable: follow the system
      }
      if (!saved) apply(media.matches ? 'dark' : 'light');
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) apply(e.newValue);
    };
    media.addEventListener('change', onSystem);
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', onSystem);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
