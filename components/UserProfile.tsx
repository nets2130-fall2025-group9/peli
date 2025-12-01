import { DeleteAccountSection } from "@/components/Account/DeleteAccountSection";
import { PasswordChangeForm } from "@/components/Account/PasswordChangeForm";
import { ProfileEditForm } from "@/components/Account/ProfileEditForm";
import { ProfileView } from "@/components/Account/ProfileView";

type Props = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: string;
  isOwnProfile: boolean;
};

export function UserProfile({ firstName, lastName, emailAddress, isOwnProfile }: Props) {
  if (!isOwnProfile) {
    return (
      <ProfileView
        firstName={firstName}
        lastName={lastName}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl space-y-6">
      <ProfileEditForm
        initialFirstName={firstName}
        initialLastName={lastName}
        emailAddress={emailAddress}
      />
      <PasswordChangeForm />
      <DeleteAccountSection />
    </div>
  );
}

