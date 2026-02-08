import type { ReactNode } from "react";

import ProtectedNavbar from "@/components/navigation/ProtectedNavbar";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ProtectedNavbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
