"use client";

import React from "react";
import { Icon } from "@iconify/react";
import Logo from "@/components/layout/Logo";

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
}

const defaultSections = [
  {
    title: "Company",
    links: [
      { name: "Home", href: "/" },
      { name: "Team", href: "#teams" },
      { name: "Why US", href: "#why-us" },
      { name: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Terms and Conditions", href: "/terms-and-conditions" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
];

const defaultSocialLinks = [
  {
    icon: <Icon icon="lucide:instagram" className="size-5" />,
    href: "https://www.instagram.com/vedictrades",
    label: "Instagram",
  },
  {
    icon: <Icon icon="lucide:twitter" className="size-5" />,
    href: "#https://x.com/vedictrades",
    label: "Twitter",
  },
];

const Footer = ({
  sections = defaultSections,
  description = "Professional trading education for everyone. Join our community and master the markets.",
  socialLinks = defaultSocialLinks,
}: FooterProps) => {
  return (
    <section className="py-16 w-full border-t">
      <div className="container mx-auto px-6 items-center">
        <div className="flex w-full flex-col justify-between  gap-10 lg:flex-row lg:items-start lg:text-left">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            {/* Logo */}
            <div className="flex items-center gap-2 lg:justify-start">
              <Logo />
            </div>
            <p className="text-muted-foreground max-w-[70%] text-sm">
              {description}
            </p>
            <ul className="text-muted-foreground flex items-center space-x-6">
              {socialLinks.map(
                (
                  social: {
                    icon: React.ReactElement;
                    href: string;
                    label: string;
                  },
                  idx: number
                ) => (
                  <li key={idx} className="hover:text-primary font-medium">
                    <a href={social.href} aria-label={social.label}>
                      {social.icon}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="grid w-full max-w-md gap-6 md:grid-cols-2 lg:gap-10">
            {sections.map(
              (
                section: {
                  title: string;
                  links: Array<{ name: string; href: string }>;
                },
                sectionIdx: number
              ) => (
                <div key={sectionIdx}>
                  <h3 className="mb-4 font-bold">{section.title}</h3>
                  <ul className="text-muted-foreground space-y-3 text-sm">
                    {section.links.map(
                      (
                        link: { name: string; href: string },
                        linkIdx: number
                      ) => (
                        <li
                          key={linkIdx}
                          className="hover:text-primary font-medium"
                        >
                          <a href={link.href}>{link.name}</a>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-center border-t py-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-muted-foreground hover:text-primary font-medium text-sm flex items-center gap-2"
          >
            <Icon icon="lucide:arrow-up" className="size-4" />
            Go to Top
          </button>
        </div>
      </div>
    </section>
  );
};

export { Footer };
