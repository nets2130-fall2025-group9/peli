import { getTopUsers, getTopMenuItems } from "@/lib/actions";
import LeaderboardView from "@/components/LeaderboardView";

export default async function LeaderboardPage() {
  const { success: usersSuccess, topUsers } = await getTopUsers(20);
  const { success: menusSuccess, topMenuItems } = await getTopMenuItems(20);

  if (!usersSuccess || !menusSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div>Error fetching leaderboard data</div>
      </div>
    );
  }

  return <LeaderboardView topUsers={topUsers} topMenuItems={topMenuItems} />;
}

