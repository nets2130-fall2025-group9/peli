"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "./ReviewModal";

interface ReviewButtonProps {
  menuItemId: string;
  hasRated: boolean;
}

export function ReviewButton({ menuItemId, hasRated }: ReviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={hasRated}
        variant={hasRated ? "outline" : "default"}
      >
        {hasRated ? "You've already reviewed this item" : "Write a Review"}
      </Button>
      <ReviewModal open={open} onOpenChange={setOpen} menuItemId={menuItemId} />
    </>
  );
}
