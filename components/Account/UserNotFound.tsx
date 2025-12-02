import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  userId?: string | null;
};

export const UserNotFound = ({ userId }: Props) => {
  return (
    <div className="min-h-screen pt-24 px-4 flex justify-center items-center">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Not Found</h1>
          <p className="text-muted-foreground text-lg">
            We couldn&apos;t find the user you&apos;re looking for. They may
            have deleted their account or the link might be incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/">Go Home</Link>
          </Button>
          {userId && (
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/account/${userId}`}>My Profile</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

