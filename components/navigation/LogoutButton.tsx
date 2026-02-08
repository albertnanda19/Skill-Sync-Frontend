"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

function deleteCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0`;
}

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
      onClick={() => {
        if (loading) return;
        setLoading(true);
        try {
          deleteCookie("access_token");
          deleteCookie("refresh_token");
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
