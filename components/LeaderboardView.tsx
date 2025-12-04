"use client";

import { TopUser, MenuItemWithStats } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/common/RatingStars";
import Link from "next/link";

interface Props {
  topUsers: TopUser[];
  topMenuItems: MenuItemWithStats[];
}

export default function LeaderboardView({ topUsers, topMenuItems }: Props) {
  const formatDiningHallName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Users Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Top Reviewers</CardTitle>
              </CardHeader>
              <CardContent>
                {topUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topUsers.map((user, index) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-muted-foreground w-8">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {user.reviewCount}{" "}
                            {user.reviewCount === 1 ? "review" : "reviews"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Menu Items Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Top Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                {topMenuItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No rated items yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topMenuItems.map((item, index) => (
                      <Link
                        key={item.id}
                        href={`/menu-item/${item.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl font-bold text-muted-foreground w-8 flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium group-hover:text-primary transition-colors truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDiningHallName(item.dining_hall)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                          <div className="flex items-center gap-2">
                            <RatingStars
                              rating={item.averageRating}
                              size="sm"
                            />
                            <span className="font-semibold text-sm">
                              {item.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({item.totalRatings})
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

