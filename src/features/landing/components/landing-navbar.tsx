"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLockup } from "@/components/brand-lockup";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#faqs", label: "FAQs" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-6">
        <BrandLockup imageSize={24} imageClassName="opacity-80" />

        <div className="hidden items-center gap-10 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname.startsWith("/blog") && link.href === "/blog"
                  ? "text-foreground"
                  : "",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className={cn(
              buttonVariants({
                variant: "ghost",
                size: "sm",
              }),
              "text-sm font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({
                size: "sm",
              }),
              "rounded-full px-5 text-sm font-medium",
            )}
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="text-foreground md:hidden"
          onClick={() => setOpen((current) => !current)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-background/95 p-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base font-medium text-muted-foreground",
                  pathname.startsWith("/blog") && link.href === "/blog"
                    ? "text-foreground"
                    : "",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                  }),
                  "w-full justify-center text-muted-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({}),
                  "w-full justify-center rounded-full",
                )}
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
