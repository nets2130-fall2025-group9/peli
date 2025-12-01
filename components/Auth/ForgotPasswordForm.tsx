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
import { useForgotPasswordContext } from "@/context/AuthProvider";
import { forgotPasswordSchema } from "@/lib/validations";
import { useForm } from "@/hooks/useForm";

export const ForgotPasswordForm = () => {
  const { signIn, isLoaded, setStep } = useForgotPasswordContext();

  const { formData, error, setError, isLoading, handleChange, handleSubmit } = useForm({
    schema: forgotPasswordSchema,
    initialValues: {
      email: "",
    },
    isLoaded: isLoaded && !!signIn,
    onSubmit: async (data) => {
      if (!signIn) return;

      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: data.email,
      });

      setStep(2);
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a code to reset
          your password
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending code..." : "Send reset code"}
          </Button>
          <Link
            href="/login"
            className={`text-sm text-center text-primary hover:underline ${isLoading && "pointer-events-none opacity-50"}`}
          >
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
};

