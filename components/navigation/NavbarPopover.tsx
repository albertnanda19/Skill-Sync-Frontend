"use client";

import * as React from "react";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type NavbarPopoverItem = {
  label: string;
  href: string;
};

export default function NavbarPopover({
  open,
  items,
  onNavigate,
}: {
  open: boolean;
  items: NavbarPopoverItem[];
  onNavigate?: () => void;
}) {
  return (
    <div
      className={cn(
        "z-50 w-56 origin-top-left rounded-xl border bg-background p-1 shadow-lg transition-all duration-150",
        open
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0",
      )}
      role="menu"
      aria-hidden={!open}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          onClick={onNavigate}
          role="menuitem"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
