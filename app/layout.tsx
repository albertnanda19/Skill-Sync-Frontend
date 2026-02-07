import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSync",
  description:
    "Skill-based job matching with match insights and skill gap guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
