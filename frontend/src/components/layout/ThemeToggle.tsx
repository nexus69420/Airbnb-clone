/**
 * Light / dark / system theme control for the profile menu.
 */

"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full animate-pulse rounded-lg bg-abnb-surface-hover" />;
  }

  return (
    <div className="flex gap-1 rounded-xl border border-abnb-border bg-abnb-surface p-1">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-abnb-fg text-abnb-bg"
                : "text-abnb-muted hover:bg-abnb-surface-hover hover:text-abnb-fg"
            }`}
            aria-pressed={active}
            aria-label={`${label} theme`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
