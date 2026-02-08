"use client";

import * as React from "react";

import { Brain } from "lucide-react";

import { Button } from "@/components/ui/button";

const STEP_MESSAGES = [
  "Scanning top job listings…",
  "Analyzing market demand…",
  "Matching opportunities to your profile…",
  "Generating salary insights…",
  "Preparing your dashboard…",
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

export default function DashboardLoadingAI({
  onRetry,
  variant = "full",
}: {
  onRetry?: () => void;
  variant?: "full" | "inline";
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [stepIndex, setStepIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(12);
  const [elapsedMs, setElapsedMs] = React.useState(0);

  React.useEffect(() => {
    const stepIntervalMs = prefersReducedMotion ? 2800 : 1700;
    const interval = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEP_MESSAGES.length);
    }, stepIntervalMs);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(65);
      return;
    }

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 80) return prev;
        const next = prev + Math.max(0.2, Math.random() * 1.6);
        return next > 80 ? 80 : next;
      });
    }, 260);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  React.useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);

    return () => window.clearInterval(interval);
  }, []);

  const showSlowHint = elapsedMs >= 10_000;
  const showRetry = elapsedMs >= 20_000;

  if (variant === "inline") {
    return (
      <div className="rounded-[18px] border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={
                prefersReducedMotion
                  ? "block size-2.5 rounded-full bg-primary/70"
                  : "block size-2.5 rounded-full bg-primary/70 animate-pulse"
              }
            />
            <div className="min-w-0">
              <div
                className="truncate text-xs font-medium text-foreground"
                aria-live="polite"
              >
                {STEP_MESSAGES[stepIndex]}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Refreshing insights…
              </div>
            </div>
          </div>

          {showRetry && onRetry ? (
            <Button onClick={onRetry} variant="outline" size="sm">
              Retry
            </Button>
          ) : (
            <div className="text-[11px] text-muted-foreground">AI</div>
          )}
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={
              prefersReducedMotion
                ? "h-full rounded-full bg-primary"
                : "h-full rounded-full bg-linear-to-r from-primary via-primary/80 to-primary transition-[width] duration-300"
            }
            style={{ width: `${Math.round(progress)}%` }}
          />
        </div>

        {showSlowHint ? (
          <div className="mt-2 text-[11px] text-muted-foreground">
            Still analyzing… taking longer than expected.
          </div>
        ) : null}
      </div>
    );
  }

  const content = (
    <div className="w-full max-w-xl rounded-[28px] border bg-card p-7 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div
            className={
              prefersReducedMotion
                ? "grid size-12 place-items-center rounded-2xl bg-primary/10"
                : "grid size-12 place-items-center rounded-2xl bg-primary/10"
            }
          >
            <Brain className="size-6 text-primary" />
          </div>
          <span
            className={
              prefersReducedMotion
                ? "absolute -right-1 -top-1 block size-3 rounded-full bg-primary/70"
                : "absolute -right-1 -top-1 block size-3 rounded-full bg-primary/70 animate-pulse"
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-tight text-foreground">
            AI is analyzing your career opportunities
          </div>
          <div className="mt-1 text-sm leading-6 text-muted-foreground">
            Scanning top jobs, market trends, and your personalized insights…
          </div>

          <div
            className={
              prefersReducedMotion
                ? "mt-5 rounded-2xl bg-muted/30 p-4"
                : "mt-5 rounded-2xl bg-muted/30 p-4"
            }
          >
            <div className="flex items-center justify-between gap-4">
              <div
                className="text-sm font-medium text-foreground"
                aria-live="polite"
              >
                {STEP_MESSAGES[stepIndex]}
              </div>
              <div className="text-xs text-muted-foreground">Powered by AI</div>
            </div>

            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={
                    prefersReducedMotion
                      ? "h-full rounded-full bg-primary"
                      : "h-full rounded-full bg-linear-to-r from-primary via-primary/80 to-primary transition-[width] duration-300"
                  }
                  style={{ width: `${Math.round(progress)}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzing opportunities</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {showSlowHint ? (
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground/90">
                  Still analyzing your data…
                </div>
                <div className="mt-1">This is taking longer than expected.</div>
              </div>
            ) : null}

            {showRetry && onRetry ? (
              <div className="mt-4">
                <Button onClick={onRetry} variant="outline">
                  Retry
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mt-5 text-xs text-muted-foreground">
            Tip: Keep this tab open—updates land automatically.
          </div>
        </div>
      </div>

      {!prefersReducedMotion ? (
        <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex min-h-[calc(100vh-1px)] w-full max-w-6xl items-center justify-center px-6 py-16">
        {content}
      </main>
    </div>
  );
}
