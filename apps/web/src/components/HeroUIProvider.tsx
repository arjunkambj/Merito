"use client";

import type React from "react";
import { HeroUIProvider as BaseHeroUIProvider } from "@heroui/react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@heroui/toast";

interface HeroUIProviderProps {
  children: unknown;
}

const AppHeroUIProvider = ({ children }: HeroUIProviderProps) => {
  // React 19 type declarations from upstream packages disagree, so treat
  // children opaquely when passing them between providers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeChildren = children as any;

  return (
    <BaseHeroUIProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider />
        {safeChildren}
      </ThemeProvider>
    </BaseHeroUIProvider>
  );
};

export default AppHeroUIProvider;
