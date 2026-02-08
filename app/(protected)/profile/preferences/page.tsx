import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PreferencesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
        {/* WIREFRAME: Simple form | Focus on clarity */}
        <div className="grid gap-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="rounded-full">
                Preferences
              </Badge>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Set your constraints
              </h1>
              <div className="max-w-2xl text-sm leading-6 text-muted-foreground">
                These preferences shape what jobs appear first—and how strict
                the match scoring is.
              </div>
            </div>
          </div>

          <Card className="rounded-[28px]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg tracking-tight">
                Matching preferences
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                Clear inputs produce clear explanations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="roles">Preferred roles</Label>
                  <Input
                    id="roles"
                    placeholder="e.g. Frontend Engineer, Fullstack"
                  />
                </div>

                <div className="grid gap-2 md:grid-cols-2 md:items-start">
                  <div className="grid gap-2">
                    <Label>Experience level</Label>
                    <Select defaultValue="mid">
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="location">Location preference</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Remote, Jakarta, Singapore"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">
                    Any constraints we should respect?
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="e.g. Only remote, no on-call, salary target..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard">
                      Save Preferences
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
