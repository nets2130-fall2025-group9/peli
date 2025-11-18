import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export const Navbar = () => {
  return (
    <div className="fixed top-0 z-50 w-full bg-background flex justify-between items-center gap-4 h-16 px-4 border-b">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/logo.png" alt="logo" width={32} height={32} />
        <h2 className="text-2xl font-bold">Peli</h2>
      </Link>
      <UserButton />
    </div>
  );
}