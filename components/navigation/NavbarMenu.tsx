"use client";

import * as React from "react";

import { ChevronDown } from "lucide-react";

import NavbarPopover, {
  type NavbarPopoverItem,
} from "@/components/navigation/NavbarPopover";
import { cn } from "@/lib/utils";

export default function NavbarMenu({
  label,
  items,
  active,
  align = "left",
  closeSignal,
}: {
  label: string;
  items: NavbarPopoverItem[];
  active?: boolean;
  align?: "left" | "right";
  closeSignal?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  React.useEffect(() => {
    setOpen(false);
  }, [closeSignal]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          active ? "text-primary" : "",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-150",
            open ? "rotate-180" : "rotate-0",
          )}
        />
        {active ? (
          <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded-full bg-primary/60" />
        ) : null}
      </button>

      <div
        className={cn(
          "absolute top-full z-50 mt-2",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        <NavbarPopover
          open={open}
          items={items}
          onNavigate={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
