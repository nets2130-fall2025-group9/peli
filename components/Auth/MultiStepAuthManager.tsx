"use client";

import React from "react";

interface Props {
  step: number;
  children: React.ReactNode[];
};

export function MultiStepAuthManager({
  step,
  children,
}: Props) {
  if (!children || children.length === 0) {
    return null;
  }

  return <>{children[step - 1]}</>;
}

