"use client";

import { Drawer, DrawerBody, DrawerContent } from "@heroui/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import SidebarContent from "./SidebarContent";
import { sidebarOpenAtom } from "@/store/atoms";
import { useDebounce } from "@/hooks/useDebounce";

const Sidebar = React.memo(({ className }: { className?: string }) => {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleResizeLogic = useCallback(() => {
    const mobile = window.innerWidth < 768;

    setIsMobile(mobile);

    if (mobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [setIsOpen]);

  const handleResize = useDebounce(handleResizeLogic, 150);

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setIsOpen(open);
    },
    [setIsOpen]
  );

  useEffect(() => {
    setIsClient(true);

    handleResizeLogic();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize, handleResizeLogic]);

  const sidebarContent = useMemo(
    () => <SidebarContent onClose={handleClose} />,
    [handleClose]
  );

  const drawerClasses = useMemo(
    () =>
      isMobile
        ? "w-screen max-w-full h-dvh bg-content1 border-r border-default-100 shadow-none p-0"
        : "max-w-66 w-66 bg-content1 border-r border-default-100 shadow-none p-0",
    [isMobile]
  );
  const sectionClasses = useMemo(() => `${className}`, [className]);

  const drawerContent = useMemo(
    () => (
      <Drawer
        hideCloseButton
        backdrop="transparent"
        className={drawerClasses}
        isOpen={isOpen}
        placement="left"
        radius="none"
        shadow="none"
        onOpenChange={handleDrawerOpenChange}
      >
        <DrawerContent className="h-full p-0">
          {(onClose) => (
            <>
              <DrawerBody className="p-0 h- rounded-none">
                <SidebarContent onClose={onClose} />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    ),
    [drawerClasses, isOpen, handleDrawerOpenChange]
  );

  if (!isClient) {
    return <section className={sectionClasses}>{sidebarContent}</section>;
  }

  return (
    <section className={sectionClasses}>
      {!isMobile && sidebarContent}
      {isMobile && drawerContent}
    </section>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
