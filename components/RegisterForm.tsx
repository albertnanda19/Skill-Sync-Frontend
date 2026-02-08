"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/useRegister";

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    if (
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }

    const maybeAxios = error as {
      response?: { data?: { message?: unknown } };
    };

    const serverMessage = maybeAxios.response?.data?.message;
    if (typeof serverMessage === "string" && serverMessage.length > 0)
      return serverMessage;
  }

  return "Something went wrong. Please try again.";
}

export default function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const isLoading = registerMutation.isPending;
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const errorMessage = registerMutation.isError
    ? getErrorMessage(registerMutation.error)
    : null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordMismatch) return;

    registerMutation.mutate(
      {
        full_name: fullName.trim().length > 0 ? fullName.trim() : undefined,
        email,
        password,
      },
      {
        onSuccess: () => {
          router.replace("/onboarding");
        },
      },
    );
  };

  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          placeholder="e.g. Albert Nanda"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          placeholder="you@email.com"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirm_password">Confirm password</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      {passwordMismatch ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Passwords do not match.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <Button
        className="w-full"
        size="lg"
        type="submit"
        disabled={isLoading || passwordMismatch}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </Button>

      <div className="text-xs leading-5 text-muted-foreground">
        By creating an account, you agree to keep your profile accurate for
        better match insights.
      </div>
    </form>
  );
}
