"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to LMS</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" disabled>Student</Button>
          <Button variant="outline" size="sm" disabled>Teacher</Button>
          <Button variant="outline" size="sm" disabled>Supervisor</Button>
          <Button variant="outline" size="sm" disabled>Admin</Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Your role is determined by your account — select is for visual reference only.
        </p>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button className="w-full">Sign In</Button>
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:underline"
        >
          Forgot your password?
        </Link>
      </CardFooter>
    </Card>
  );
}
