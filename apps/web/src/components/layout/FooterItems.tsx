"use client";

import { cn } from "@heroui/theme";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

import { DASHBOARD_FOOTER_ITEMS } from "@/constants/dashboard-sidebar";

export const FooterItems = () => {
  const pathname = usePathname();

  const isActive = useCallback((href: string) => pathname === href, [pathname]);

  const footerItemsContent = useMemo(() => {
    return DASHBOARD_FOOTER_ITEMS.map((item) => {
      const active = isActive(item.href || "");
      const iconName = active && item.activeIcon ? item.activeIcon : item.icon;

      return (
        <Link
          key={item.key}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200",
            "no-underline w-full group",
            active
              ? "bg-primary/20 text-primary-600 font-semibold"
              : "text-default-700 hover:text-foreground hover:bg-default-200/70"
          )}
          href={item.href || "#"}
          prefetch={true}
        >
          {iconName && (
            <Icon
              aria-hidden
              className={cn(
                "shrink-0 transition-all w-5 h-5",
                active
                  ? "text-primary-600"
                  : "text-default-700 group-hover:text-foreground"
              )}
              icon={iconName}
            />
          )}
          <span className="text-sm font-medium">{item.label}</span>
        </Link>
      );
    });
  }, [isActive]);

  return <div className="flex gap-1 flex-col">{footerItemsContent}</div>;
};
