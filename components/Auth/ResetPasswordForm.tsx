"use client";

import { useRouter } from "next/navigation";
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
import { resetPasswordSchema } from "@/lib/validations";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useResendCode } from "@/hooks/useResendCode";

export function ResetPasswordForm() {
  const router = useRouter();
  const { signIn, isLoaded } = useForgotPasswordContext();

  const { formData, error, setError, isLoading, handleChange, handleSubmit } =
    useAuthForm({
      schema: resetPasswordSchema,
      initialValues: {
        code: "",
        password: "",
        confirmPassword: "",
      },
      isLoaded: isLoaded && !!signIn,
      onSubmit: async (data) => {
        if (!signIn) return;

        const res = await signIn.attemptFirstFactor({
          strategy: "reset_password_email_code",
          code: data.code,
          password: data.password,
        });

        if (res.status === "complete") {
          // Password reset successful, redirect to login
          router.push("/login");
        } else {
          setError("Password reset incomplete. Please try again.");
        }
      },
    });

  const {
    error: resendError,
    isLoading: isResending,
    handleResend,
    cooldownRemaining,
    canResend,
  } = useResendCode({
    isLoaded: isLoaded && !!signIn,
    onResend: async () => {
      if (!signIn) return;
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: signIn.identifier || "",
      });
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          Enter the code we sent to{" "}
          <span className="font-medium text-foreground">
            {signIn?.identifier}
          </span>{" "}
          and choose a new password
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          {resendError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {resendError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="code">Reset code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={formData.code}
              onChange={handleChange}
              maxLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting password..." : "Reset password"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={!canResend || isResending || isLoading}
              className="h-auto p-0 text-sm cursor-pointer"
            >
              {isResending
                ? "Resending..."
                : cooldownRemaining > 0
                  ? `Resend (${cooldownRemaining}s)`
                  : "Resend"}
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

