import type { Metadata } from "next";
import "@/styles/globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import AppHeroUIProvider from "@/components/HeroUIProvider";

export const metadata: Metadata = {
  title: "OKTOO AI",
  description: "OKTOO AI is a platform for trading education and training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ConvexClientProvider>
          <AppHeroUIProvider>{children}</AppHeroUIProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
