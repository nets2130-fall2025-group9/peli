import { RatingStars } from "@/components/common/RatingStars";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  firstName: string | null;
  totalRatings: number;
  averageRating: number;
};

export const RatingSummary = ({
  firstName,
  totalRatings,
  averageRating,
}: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Summary</CardTitle>
        <CardDescription>Overview of {firstName || "User"}&apos;s ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Ratings</p>
            <p className="text-3xl font-bold">{totalRatings}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold">
                {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
              </p>
              {averageRating > 0 && <RatingStars rating={averageRating} />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

