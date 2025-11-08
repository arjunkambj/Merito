import type { Metadata } from "next";
import "@/styles/globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import AppHeroUIProvider from "@/components/HeroUIProvider";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export const metadata: Metadata = {
  title: "Merito Lead Management CRM",
  description: "Merito is a platform for managing leads from Meta and Google.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ConvexClientProvider>
              <AppHeroUIProvider>{children}</AppHeroUIProvider>
            </ConvexClientProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
