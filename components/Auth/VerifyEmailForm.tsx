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
import { useSignUpContext } from "@/context/AuthProvider";
import { verifyEmailSchema } from "@/lib/validations";
import { useAuthForm } from "@/hooks/useAuthForm";
import { useResendCode } from "@/hooks/useResendCode";

export function VerifyEmailForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUpContext();

  const { formData, error, setError, isLoading, handleChange, handleSubmit } =
    useAuthForm({
      schema: verifyEmailSchema,
      initialValues: {
        code: "",
      },
      isLoaded: isLoaded && !!signUp && !!setActive,
      onSubmit: async (data) => {
        if (!signUp || !setActive) return;

        const res = await signUp.attemptEmailAddressVerification({
          code: data.code,
        });

        if (res.status === "complete") {
          await setActive({ session: res.createdSessionId });
          router.push("/");
        } else {
          setError("Verification incomplete. Please try again.");
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
    isLoaded: isLoaded && !!signUp,
    onResend: async () => {
      if (!signUp) return;
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          We sent a verification code to{" "}
          <span className="font-medium text-foreground">
            {signUp?.emailAddress}
          </span>
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
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter 6-digit code"
              value={formData.code}
              onChange={handleChange}
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify email"}
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

