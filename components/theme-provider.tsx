"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wraps next-themes in a way that survives React 19's strict hydration
 * rules. next-themes injects a small <script> at render time to read the
 * stored theme before paint (avoids flash of unstyled content) — that
 * pattern breaks under React 19's "no script tags inside components" rule.
 * The fix is to drop the inline <script>; the trade-off is a brief flash
 * of light theme on the first paint of dark-mode users. Acceptable for an
 * internal dashboard.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
