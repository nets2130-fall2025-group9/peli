"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MenuItemRating } from "@/lib/types";
import { RatingStars } from "@/components/common/RatingStars";

interface ReviewsListProps {
  ratings: MenuItemRating[];
}

export function ReviewsList({ ratings: initialRatings }: ReviewsListProps) {
  const [ratings, setRatings] = useState(initialRatings);
  const [reportingIds, setReportingIds] = useState<Set<string>>(new Set());

  const handleReport = async (ratingId: string) => {
    if (reportingIds.has(ratingId)) return;

    setReportingIds((prev) => new Set(prev).add(ratingId));

    try {
      const response = await fetch(`/api/ratings/${ratingId}/report`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to report rating");
      }

      const data = await response.json();

      if (data.deleted) {
        setRatings((prev) => prev.filter((rating) => rating.id !== ratingId));
      }
    } catch (error) {
      console.error("Error reporting rating:", error);
    } finally {
      setReportingIds((prev) => {
        const next = new Set(prev);
        next.delete(ratingId);
        return next;
      });
    }
  };

  if (ratings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews ({ratings.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">
                  {rating.user
                    ? `${rating.user.first_name} ${rating.user.last_name}`
                    : "Anonymous"}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <RatingStars rating={rating.rating} />
                <span className="text-sm font-medium">{rating.rating}</span>
              </div>
            </div>
            {rating.description && (
              <p className="text-sm text-foreground">{rating.description}</p>
            )}
            {rating.image_path && (
              <div className="mt-2">
                <img
                  src={rating.image_path}
                  alt="Review image"
                  className="rounded-md max-w-full h-auto max-h-48 object-cover"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {new Date(rating.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReport(rating.id)}
                disabled={reportingIds.has(rating.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                {reportingIds.has(rating.id) ? "Reporting..." : "Report"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
