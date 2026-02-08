"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

export default function JobsSectionNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center rounded-full border bg-background p-1 shadow-sm">
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200",
              isActive
                ? "bg-linear-to-r from-indigo-600 to-violet-600 text-white"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
