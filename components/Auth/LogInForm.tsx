"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSignInContext } from "@/context/AuthProvider";
import { logInSchema } from "@/lib/validations";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useRouter } from "next/navigation";

export const LogInForm = () => {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignInContext();

  const { formData, error, setError, isLoading, handleChange, handleSubmit } = useAuthForm({
    schema: logInSchema,
    initialValues: {
      email: "",
      password: "",
    },
    isLoaded: isLoaded && !!signIn,
    onSubmit: async (data) => {
      if (!signIn || !setActive) return;

      const res = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push("/");
      } else {
        setError("Login incomplete. Please try again.");
      }
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="pennkey@upenn.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className={`text-primary hover:underline ${isLoading && "pointer-events-none opacity-50"}`}
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};