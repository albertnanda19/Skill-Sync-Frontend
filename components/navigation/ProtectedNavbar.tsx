"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Menu, X, UserCircle2 } from "lucide-react";

import NavbarMenu from "@/components/navigation/NavbarMenu";
import LogoutButton from "@/components/navigation/LogoutButton";
import { cn } from "@/lib/utils";

export default function ProtectedNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [closeSignal, setCloseSignal] = React.useState(0);

  const activeGroup = React.useMemo(() => {
    if (pathname.startsWith("/jobs")) return "jobs";
    if (pathname.startsWith("/users")) return "profile";
    if (pathname.startsWith("/dashboard")) return "insights";
    if (pathname.startsWith("/skills-gap")) return "insights";
    if (pathname.startsWith("/pipeline")) return "system";
    return null;
  }, [pathname]);

  const closeAll = React.useCallback(() => {
    setMobileOpen(false);
    setCloseSignal((v) => v + 1);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[60px] w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          <Link
            href="/jobs"
            className="text-base font-semibold tracking-tight text-foreground"
            onClick={closeAll}
          >
            <span className="bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              SkillSync
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavbarMenu
            label="Jobs"
            active={activeGroup === "jobs"}
            closeSignal={closeSignal}
            items={[
              { label: "Browse Jobs", href: "/jobs" },
              { label: "Recommendations", href: "/jobs/recommendations" },
            ]}
          />
          <NavbarMenu
            label="Insights"
            active={activeGroup === "insights"}
            closeSignal={closeSignal}
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Skills Gap", href: "/skills-gap" },
            ]}
          />
          <NavbarMenu
            label="Profile"
            active={activeGroup === "profile"}
            closeSignal={closeSignal}
            items={[
              { label: "My Profile", href: "/users/me" },
              { label: "My Skills", href: "/users/skills" },
            ]}
          />
          <NavbarMenu
            label="System"
            active={activeGroup === "system"}
            closeSignal={closeSignal}
            items={[{ label: "Pipeline Status", href: "/pipeline/status" }]}
          />
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <UserCircle2 className="size-5" />
          </div>
          <LogoutButton />
        </div>
      </div>

      <div
        className={cn(
          "border-t bg-background md:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="grid gap-2">
            <div className="grid gap-1">
              <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
                Jobs
              </div>
              <Link
                href="/jobs"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                Browse Jobs
              </Link>
              <Link
                href="/jobs/recommendations"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                Recommendations
              </Link>
            </div>

            <div className="grid gap-1">
              <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
                Insights
              </div>
              <Link
                href="/dashboard"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                Dashboard
              </Link>
              <Link
                href="/skills-gap"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                Skills Gap
              </Link>
            </div>

            <div className="grid gap-1">
              <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
                Profile
              </div>
              <Link
                href="/users/me"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                My Profile
              </Link>
              <Link
                href="/users/skills"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                My Skills
              </Link>
            </div>

            <div className="grid gap-1">
              <div className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
                System
              </div>
              <Link
                href="/pipeline/status"
                className="rounded-lg px-2 py-2 text-sm hover:bg-primary/10 hover:text-primary"
                onClick={closeAll}
              >
                Pipeline Status
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
