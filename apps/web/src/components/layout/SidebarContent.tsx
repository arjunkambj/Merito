"use client";

import { Button } from "@heroui/react";
import { ScrollShadow } from "@heroui/react";
import { cn } from "@heroui/theme";
import { Icon } from "@iconify/react";
import { useAtom } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import { DASHBOARD_SIDEBAR_ITEMS } from "@/constants/dashboard-sidebar";
import { sidebarOpenAtom } from "@/store/atoms";
import { FooterItems } from "./FooterItems";
import SidebarMenu from "./SidebarMenu";

interface SidebarContentProps {
  onClose: () => void;
}

const SidebarContent = React.memo(({ onClose }: SidebarContentProps) => {
  const [isOpen] = useAtom(sidebarOpenAtom);
  const pathname = usePathname();

  const containerClasses = useMemo(
    () =>
      `relative flex h-full flex-1 flex-col transition-all duration-300 ease-in-out ${
        isOpen
          ? "w-full max-w-full opacity-100 sm:max-w-66 sm:w-66"
          : "w-0 p-0 opacity-0 overflow-hidden"
      }`,
    [isOpen]
  );

  const scrollShadowClasses = useMemo(
    () =>
      `h-full max-h-full transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`,
    [isOpen]
  );

  const handleCloseClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const logoSection = useMemo(
    () => (
      <div className="flex items-center  justify-between px-8 py-2">
        <Button
          isIconOnly
          aria-label="Close sidebar"
          className="sm:hidden absolute right-2 top-2 hover:bg-default-200"
          size="sm"
          variant="flat"
          radius="lg"
          onPress={handleCloseClick}
        >
          <Icon icon="solar:close-circle-bold-duotone" width={20} />
        </Button>
      </div>
    ),
    [handleCloseClick]
  );

  const overviewItem = useMemo(
    () => (
      <Link
        aria-current={pathname === "/overview" ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200",
          "no-underline w-full group",
          pathname === "/overview"
            ? "bg-primary/20 text-primary-600 font-semibold"
            : "text-default-700 hover:text-foreground hover:bg-default-200/70"
        )}
        href="/overview"
        prefetch={true}
      >
        <Icon
          aria-hidden
          className={cn(
            "shrink-0 transition-all w-5 h-5",
            pathname === "/overview"
              ? "text-primary-600"
              : "text-default-700 group-hover:text-foreground"
          )}
          icon="solar:home-2-bold-duotone"
        />
        <span className="text-sm font-medium truncate">Overview</span>
      </Link>
    ),
    [pathname]
  );

  const sidebarMenuContent = useMemo(
    () => (
      <SidebarMenu
        items={DASHBOARD_SIDEBAR_ITEMS.map((section) => ({
          key: section.label.toLowerCase().replace(/\s+/g, "-"),
          title: section.label,
          items: section.items.map((item) => ({
            key: item.key,
            title: item.label,
            icon: item.icon,
            href: item.href,
          })),
        }))}
      />
    ),
    []
  );

  const footerItemsContent = useMemo(() => <FooterItems />, []);

  return (
    <div className={containerClasses}>
      {/* Logo and Close Button */}
      <div className="mb-4">{logoSection}</div>

      {/* Overview Item */}
      <div className="mb-3 px-6">{overviewItem}</div>

      {/* Main Navigation */}
      <div className="flex-1 min-h-0 px-6">
        <ScrollShadow className={scrollShadowClasses}>
          {sidebarMenuContent}
        </ScrollShadow>
      </div>

      {/* Footer Items */}
      <div className="mt-auto pt-3 border-t border-default-200 px-6 pb-6">
        {footerItemsContent}
      </div>
    </div>
  );
});

SidebarContent.displayName = "SidebarContent";

export default SidebarContent;
