import { auth } from "@clerk/nextjs/server";
import { UserProfile } from "@/components/UserProfile";
import { UserNotFound } from "@/components/Account/UserNotFound";
import { getUserProfile } from "@/lib/actions";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  const userProfile = await getUserProfile(userId, id);

  if (!userProfile) {
    return <UserNotFound userId={userId} />;
  }

  const { firstName, lastName, emailAddress, isOwnProfile } = userProfile;

  return (
    <div className="min-h-screen pt-24 px-4 flex justify-center items-start">
      <UserProfile
        firstName={firstName}
        lastName={lastName}
        emailAddress={emailAddress}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}