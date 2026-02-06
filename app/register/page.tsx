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
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* WIREFRAME: Centered narrow container | Judul besar | Form stacked vertical | CTA full-width */}
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
              <div className="text-xs text-muted-foreground">
                Create your account
              </div>
            </div>
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>

        <Card className="border/60 rounded-[22px]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl tracking-tight">
              Get started
            </CardTitle>
            <CardDescription className="text-sm leading-6">
              Build a skill profile once—use it to understand every job match.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
