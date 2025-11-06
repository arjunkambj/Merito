"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import Logo from "@/components/layout/Logo";
import { Button } from "@heroui/react";

const navItems = [
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "Why US",
    href: "#why-us",
  },
  {
    label: "Team",
    href: "#teams",
  },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto max-w-7xl  px-6 flex py-3.5 items-center">
        <Link href="/" className="flex items-center flex-1">
          <Logo />
        </Link>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium hover:text-foreground/80 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button color="primary" as={Link} href="/sign-in">
          Get Started
          <Icon icon="lucide:arrow-right" className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
