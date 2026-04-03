"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-9 w-16 items-center rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className="h-7 w-7 rounded-full bg-white dark:bg-zinc-900" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-9 w-16 items-center rounded-full bg-gradient-to-r from-zinc-200 to-zinc-300 p-1 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:from-zinc-700 dark:to-zinc-600"
      aria-label="Toggle theme"
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      
      {/* Sliding toggle */}
      <div
        className={`relative flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 dark:bg-zinc-900 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {/* Sun Icon (Light Mode) */}
        <svg
          className={`absolute h-4 w-4 text-yellow-500 transition-all duration-300 ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon (Dark Mode) */}
        <svg
          className={`absolute h-4 w-4 text-blue-500 transition-all duration-300 ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>

      {/* Stars animation (dark mode) */}
      {isDark && (
        <>
          <div className="absolute right-3 top-2 h-1 w-1 animate-pulse rounded-full bg-yellow-300" />
          <div className="absolute right-2 top-4 h-0.5 w-0.5 animate-pulse rounded-full bg-yellow-200 delay-100" />
        </>
      )}
    </button>
  );
}
