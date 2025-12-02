import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItemDB } from "@/lib/types";

interface MenuItemsGridProps {
  menuItems: MenuItemDB[];
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
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="text-base">{item.name}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

