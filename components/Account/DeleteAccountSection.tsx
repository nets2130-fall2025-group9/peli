"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteUserAccount } from "@/lib/actions";

export function DeleteAccountSection() {
  const router = useRouter();
  const { signOut } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    setError("");

    const result = await deleteUserAccount();

    if (result.success) {
      await signOut();
      router.push("/login");
    } else {
      setError(result.error || "Failed to delete account");
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-4">
            {error}
          </div>
        )}
        {!showDeleteConfirm ? (
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="font-semibold text-destructive">
                Are you absolutely sure?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This action cannot be undone. This will permanently delete your
                account and remove all of your data from our servers.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Yes, Delete My Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

