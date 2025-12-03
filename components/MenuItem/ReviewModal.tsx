"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { containsBadWords } from "@/lib/badwords";
import { useRouter } from "next/navigation";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuItemId: string;
}

export function ReviewModal({
  open,
  onOpenChange,
  menuItemId,
}: ReviewModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if description contains bad words
  const hasBadWords = useMemo(() => {
    return containsBadWords(description);
  }, [description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (hasBadWords) {
      setError("Review contains inappropriate language");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu_item_id: menuItemId,
          rating,
          description: description.trim() || null,
          image_path: null, // TODO: null for now, need to handle image upload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      // Success! Close modal and refresh the page to show new review
      onOpenChange(false);
      router.refresh();
      
      // Reset form
      setRating(0);
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (value: number) => {
    setRating(value);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this menu item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleStarClick(value)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        value <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      } transition-colors`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-sm text-destructive mt-1">{error}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Review (Optional)</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError(null);
                }}
                className={`mt-2 w-full min-h-[100px] rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring ${
                  hasBadWords
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : "border-input"
                }`}
                placeholder="Share your thoughts about this menu item..."
              />
              {hasBadWords && (
                <p className="text-sm text-destructive mt-1">
                  Review contains inappropriate language
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || hasBadWords || rating === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
