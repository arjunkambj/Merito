"use client";

import { Button } from "@heroui/react";
import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function DashBoardHeader({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header
      className={`flex px-6 py-4 justify-end items-center w-full border-b border-default-200 ${className || ""}`}
    >
      <div aria-hidden className="h-6 mx-2 w-px bg-default-200" />
    </header>
  );
}
