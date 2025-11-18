"use client";

import React from "react";

type MultiStepAuthManagerProps = {
  step: number;
  children: React.ReactNode[];
};

export function MultiStepAuthManager({
  step,
  children,
}: MultiStepAuthManagerProps) {
  if (!children || children.length === 0) {
    return null;
  }

  return <>{children[step - 1]}</>;
}

