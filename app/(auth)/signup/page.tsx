"use client";

import { useSignUpContext } from "@/context/AuthProvider";
import { MultiStepAuthManager } from "@/components/Auth/MultiStepAuthManager";
import { SignUpForm } from "@/components/Auth/SignUpForm";
import { VerifyEmailForm } from "@/components/Auth/VerifyEmailForm";

export default function SignUpPage() {
  const { step } = useSignUpContext();

  return (
    <MultiStepAuthManager step={step}>
      <SignUpForm />
      <VerifyEmailForm />
    </MultiStepAuthManager>
  );
}

