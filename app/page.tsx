import DiningHallMenu from "@/components/DiningHallMenu";
import { getDiningHalls } from "@/lib/actions";
import { DiningHall } from "@/lib/types";

export default async function Home() {
  const { success, diningHalls } = await getDiningHalls();
  
  if (!success || diningHalls.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div>Error fetching dining halls</div>
      </div>
    );
  }

  const defaultDiningHall = diningHalls[0].name as DiningHall;

  return (
    <DiningHallMenu
      diningHalls={diningHalls}
      initialDiningHall={defaultDiningHall}
    />
  );
}
