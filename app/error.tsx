"use client";

import * as React from "react";

import Link from "next/link";

import { AlertTriangle, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Error page */}
      <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-14">
        <Empty className="w-full rounded-[28px] border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertTriangle className="size-5" />
            </EmptyMedia>
            <EmptyTitle>Something broke</EmptyTitle>
            <EmptyDescription>
              Try again, or go back to the dashboard. If this keeps happening, it’s likely a UI state mismatch.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={() => reset()}>Retry</Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  Go to dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
