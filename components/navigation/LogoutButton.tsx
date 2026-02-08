"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      disabled={loading}
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
        } finally {
          router.replace("/login");
        }
      }}
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  );
}
