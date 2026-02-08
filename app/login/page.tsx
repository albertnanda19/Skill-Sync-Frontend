import Link from "next/link";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Mirip register tapi lebih ringkas | Link ke register di bawah */}
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-14">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                SkillSync
              </div>
              <div className="text-xs text-muted-foreground">Welcome back</div>
            </div>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>

        <Card className="rounded-[22px]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-sm leading-6">
              Continue to your jobs feed and review your latest matches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />

            <div className="mt-5 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                className="text-foreground underline underline-offset-4"
                href="/register"
              >
                Create an account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
