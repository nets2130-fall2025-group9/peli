import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MenuItemWithStats } from "@/lib/types";

interface MenuItemsGridProps {
  menuItems: MenuItemWithStats[];
  isLoading: boolean;
}

export default function MenuItemsGrid({
  menuItems,
  isLoading,
}: MenuItemsGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          No menu items available for this meal type.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {menuItems.map((item) => (
        <Link key={item.id} href={`/menu-item/${item.id}`}>
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
            <CardHeader>
              <CardTitle className="text-base">{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {item.averageRating > 0
                    ? item.averageRating.toFixed(1)
                    : "N/A"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({item.totalRatings}{" "}
                  {item.totalRatings === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
