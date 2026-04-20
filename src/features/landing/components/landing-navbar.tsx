"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faqs", label: "FAQs" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Otogent" width={28} height={28} />
          <span className="font-brand text-2xl font-bold tracking-tight">
            Otogent
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
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
              "text-muted-foreground",
            )}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className={buttonVariants({
              variant: "hero",
              size: "sm",
            })}
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

      {open ? (
        <div className="space-y-3 border-t border-border bg-background/95 p-4 backdrop-blur-xl md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 text-sm text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
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
              buttonVariants({
                variant: "hero",
              }),
              "mt-2 w-full justify-center",
            )}
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
