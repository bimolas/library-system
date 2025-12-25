"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, UserCircle, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { mockCurrentUser, mockAdminUser } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("USER");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await import("@/services/auth.service").then((mod) =>
        mod.login(email, password, selectedRole)
      );
      if (selectedRole === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error?.message || "Unable to login. Please try again.");
      // alert(error?.message || "Unable to login. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/20 p-4">
      <Card className="w-full max-w-md p-8 border-border animate-scaleIn hover-lift transition-smooth">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center hover-scale transition-smooth">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to LibraryHub</h1>
          <p className="text-muted-foreground text-sm text-center">
            Sign in to your account
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <Label className="text-foreground mb-3 block">Login As</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={selectedRole === "USER" ? "default" : "outline"}
              className={`gap-2 ${
                selectedRole === "USER"
                  ? "hover-glow"
                  : "bg-transparent hover-border"
              } transition-smooth`}
              onClick={() => setSelectedRole("USER")}
            >
              <UserCircle className="w-4 h-4" />
              Student
            </Button>
            <Button
              type="button"
              variant={selectedRole === "ADMIN" ? "default" : "outline"}
              className={`gap-2 ${
                selectedRole === "ADMIN"
                  ? "hover-glow"
                  : "bg-transparent hover-border"
              } transition-smooth`}
              onClick={() => setSelectedRole("ADMIN")}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
            {error}
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-3 text-xs underline opacity-80 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={
                  selectedRole === "ADMIN"
                    ? "admin@university.edu"
                    : "you@university.edu"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 hover-border transition-smooth"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Link
                href="#"
                className="text-xs text-primary hover:underline transition-smooth"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 hover-border transition-smooth"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full hover-glow transition-smooth"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full bg-transparent hover-border transition-smooth"
            onClick={() => alert("Student ID login feature")}
          >
            Sign in with Student ID
          </Button>
        </div>

        {selectedRole === "USER" && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-medium transition-smooth"
            >
              Sign up now
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
