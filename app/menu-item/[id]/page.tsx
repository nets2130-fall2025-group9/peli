import { getMenuItem } from "@/lib/actions";
import { RatingStars } from "@/components/common/RatingStars";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, menuItem, error } = await getMenuItem(id);

  if (!success || !menuItem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Menu Item Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The menu item you're looking for doesn't exist."}
          </p>
          <Link href="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black pt-16">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground mb-6 inline-block"
        >
          ← Back to Menu
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{menuItem.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Dining Hall
                </p>
                <p className="font-medium">{menuItem.dining_hall}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Meal Types</p>
                <div className="flex flex-wrap gap-2">
                  {menuItem.meal_types.map((mealType) => (
                    <span
                      key={mealType}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Rating</p>
                <div className="flex items-center gap-3">
                  <RatingStars rating={menuItem.averageRating} />
                  <span className="text-lg font-semibold">
                    {menuItem.averageRating > 0
                      ? menuItem.averageRating.toFixed(1)
                      : "No ratings yet"}
                  </span>
                  {menuItem.totalRatings > 0 && (
                    <span className="text-muted-foreground">
                      ({menuItem.totalRatings}{" "}
                      {menuItem.totalRatings === 1 ? "rating" : "ratings"})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
