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
      className={`flex px-12 py-2 justify-end items-center w-full border-b border-default-200 ${className || ""}`}
    >
      {mounted && (
        <Tooltip
          content={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
          placement="bottom"
          delay={300}
        >
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Icon
              icon={
                theme === "dark" ? "solar:sun-bold-duotone" : "solar:moon-bold"
              }
              width={20}
            />
          </Button>
        </Tooltip>
      )}

      <div aria-hidden className="h-6 mx-2 w-px bg-default-200" />
    </header>
  );
}
