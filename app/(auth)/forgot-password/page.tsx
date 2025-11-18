"use client";

import { useForgotPasswordContext } from "@/context/AuthProvider";
import { MultiStepAuthManager } from "@/components/Auth/MultiStepAuthManager";
import { ForgotPasswordForm } from "@/components/Auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/Auth/ResetPasswordForm";

export default function ForgotPasswordPage() {
  const { step } = useForgotPasswordContext();

  return (
    <MultiStepAuthManager step={step}>
      <ForgotPasswordForm />
      <ResetPasswordForm />
    </MultiStepAuthManager>
  );
}
