import { auth } from "@clerk/nextjs/server";
import { DeleteAccountSection } from "@/components/Account/DeleteAccountSection";
import { PasswordChangeForm } from "@/components/Account/PasswordChangeForm";
import { ProfileEditForm } from "@/components/Account/ProfileEditForm";
import { RatingList } from "@/components/Account/RatingList";
import { RatingSummary } from "@/components/Account/RatingSummary";
import { UserNotFound } from "@/components/Account/UserNotFound";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getUserProfile, getUserRatings } from "@/lib/actions";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  const userProfile = await getUserProfile(userId, id);
  if (!id || !userProfile.user) {
    return <UserNotFound userId={userId} />;
  }

  const userRatings = await getUserRatings(id);

  const { firstName, lastName, emailAddress, isOwnProfile } = userProfile.user;
  const { ratings, summary } = userRatings;

  return (
    <div className="min-h-screen pt-24 px-4 flex justify-center items-start">
      <div className="w-full max-w-2xl space-y-6">
        {isOwnProfile ? (
          <Tabs defaultValue="ratings" className="w-full">
            <TabsList>
              <TabsTrigger value="ratings">Ratings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            <TabsContent value="ratings" className="space-y-6 my-6">
              <RatingSummary
                firstName={firstName}
                totalRatings={summary.totalRatings}
                averageRating={summary.averageRating}
              />
              <RatingList ratings={ratings} />
            </TabsContent>
            <TabsContent value="profile" className="space-y-6 my-6">
              <ProfileEditForm
                initialFirstName={firstName}
                initialLastName={lastName}
                emailAddress={emailAddress}
              />
              <PasswordChangeForm />
              <DeleteAccountSection />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <RatingSummary
              firstName={firstName}
              totalRatings={summary.totalRatings}
              averageRating={summary.averageRating}
            />
            <RatingList ratings={ratings} />
          </div>
        )}
      </div>
    </div>
  );
}