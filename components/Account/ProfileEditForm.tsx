"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserProfile } from "@/lib/actions";
import { updateProfileSchema } from "@/lib/validations";
import { useForm } from "@/hooks/useForm";

interface Props {
  initialFirstName: string | null;
  initialLastName: string | null;
  emailAddress: string;
};

export const ProfileEditForm = ({
  initialFirstName,
  initialLastName,
  emailAddress,
}: Props) => {
  const {
    formData,
    error,
    setError,
    success,
    setSuccess,
    isLoading,
    handleChange,
    handleSubmit,
  } = useForm({
    schema: updateProfileSchema,
    initialValues: {
      firstName: initialFirstName || "",
      lastName: initialLastName || "",
    },
    onSubmit: async (data) => {
      const result = await updateUserProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      });

      if (result.success) {
        setSuccess("Profile updated successfully!");
      } else {
        setError(result.error || "Failed to update profile");
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">My Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="p-2 bg-muted rounded-md text-muted-foreground">
              {emailAddress}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

