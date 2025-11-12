"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export type SidebarItem = {
  key: string;
  title: string;
  icon?: string;
  href?: string;
  items?: SidebarItem[];
  isCategoryOpen?: boolean;
};

export type SidebarMenuProps = {
  items: SidebarItem[];
  className?: string;
};

const SidebarMenu = ({ items, className }: SidebarMenuProps) => {
  const pathname = usePathname();

  const isActive = useCallback(
    (href: string) => {
      return pathname === href;
    },
    [pathname]
  );

  // Memoize defaultExpandedKeys to prevent hydration issues
  const defaultExpandedKeys = useMemo(() => {
    return items
      .filter((item) => item.isCategoryOpen !== false)
      .map((item) => item.key);
  }, [items]);

  const renderMenuItem = useCallback(
    (item: SidebarItem) => (
      <Link
        key={item.key}
        aria-current={isActive(item.href || "") ? "page" : undefined}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 no-underline group ${isActive(item.href || "") ? "bg-default-200/95 text-default-900 font-semibold" : "text-default-700 hover:text-foreground hover:bg-default-200/70"}`}
        href={item.href || "#"}
        prefetch={true}
      >
        {item.icon && (
          <Icon
            aria-hidden
            className={`shrink-0 transition-all ${isActive(item.href || "") ? "text-default-900" : "text-default-700 group-hover:text-foreground"}`}
            icon={item.icon}
            width={18}
          />
        )}
        <span className="text-sm font-medium truncate">{item.title}</span>
      </Link>
    ),
    [isActive]
  );

  const renderCategory = useCallback(
    (category: SidebarItem) => (
      <AccordionItem
        key={category.key}
        aria-label={category.title}
        classNames={{
          base: "bg-transparent shadow-none border-none px-0 focus-visible:ring-0 focus:ring-0 ring-0 focus:outline-none",
          heading: "pr-0 focus-visible:ring-0 focus:ring-0 ring-0",
          trigger:
            "px-4 py-2 min-h-10 h-10 rounded-lg hover:bg-default-100 data-[hover=true]:bg-default-100 focus-visible:ring-0 focus:ring-0 ring-0 transition-colors",
          content: "py-0 pl-0",
          indicator: "text-default-600 data-[open=true]:rotate-90",
        }}
        indicator={
          <Icon
            aria-hidden
            className="transition-transform"
            icon="solar:alt-arrow-right-linear"
            width={16}
          />
        }
        title={
          <div className="flex h-10 items-center gap-2.5">
            {category.icon && (
              <Icon
                aria-hidden
                className="text-default-600"
                icon={category.icon}
                width={18}
              />
            )}
            <span className="text-xs font-bold text-default-700 uppercase tracking-wider">
              {category.title}
            </span>
          </div>
        }
      >
        <div className="flex flex-col gap-1.5 overflow-hidden mt-1.5">
          {category.items?.map(renderMenuItem)}
        </div>
      </AccordionItem>
    ),
    [renderMenuItem]
  );

  const accordionContent = useMemo(
    () => (
      <Accordion
        className="px-0 gap-3"
        defaultExpandedKeys={defaultExpandedKeys}
        selectionMode="multiple"
        variant="splitted"
      >
        {items.map(renderCategory)}
      </Accordion>
    ),
    [defaultExpandedKeys, items, renderCategory]
  );

  return <nav className={`w-full ${className || ""}`}>{accordionContent}</nav>;
};

export default SidebarMenu;
