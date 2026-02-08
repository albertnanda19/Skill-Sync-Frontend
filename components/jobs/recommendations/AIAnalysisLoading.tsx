"use client";

import * as React from "react";
import { BrainCircuit } from "lucide-react";

const DEFAULT_MESSAGES = [
  "Scanning your skill profile",
  "Matching skills with job descriptions",
  "Ranking the most relevant opportunities",
  "Preparing personalized recommendations",
];

type Props = {
  messages?: string[];
  intervalMs?: number;
};

export default function AIAnalysisLoading({
  messages = DEFAULT_MESSAGES,
  intervalMs = 1800,
}: Props) {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (messages.length <= 1) return;

    const id = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [intervalMs, messages]);

  const message = messages[Math.min(messageIndex, Math.max(0, messages.length - 1))];

  return (
    <div className="grid min-h-[420px] place-items-center rounded-[28px] border bg-card px-6 py-14 shadow-sm">
      <div className="mx-auto w-full max-w-xl text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <BrainCircuit className="size-7 animate-pulse" />
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-lg font-semibold tracking-tight sm:text-xl">
            AI is analyzing your skills and matching them with relevant job opportunities...
          </div>

          <div className="mx-auto flex w-fit items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary/70" />
            <div className="min-h-[20px]">{message}</div>
            <div className="flex items-center gap-1" aria-hidden="true">
              <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:0ms]" />
              <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:150ms]" />
              <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:300ms]" />
            </div>
          </div>

          <div className="pt-6 text-xs leading-5 text-muted-foreground">
            Recommendations are based on jobs that have been previously searched by users.
          </div>
        </div>
      </div>
    </div>
  );
}
