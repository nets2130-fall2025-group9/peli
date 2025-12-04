"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  return (
    <div className="fixed top-0 z-50 w-full bg-background flex justify-between items-center gap-4 h-16 px-4 border-b">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={32} height={32} />
          <h2 className="text-2xl font-bold">Peli</h2>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Menus
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/leaderboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Leaderboard
          </Link>
        </nav>
      </div>
      {userId && <UserButton userProfileUrl={`/account/${userId}`} />}
    </div>
  );
};