"use client";

import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  firstName: string | null;
  lastName: string | null;
};

export function ProfileView({ firstName, lastName }: Props) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{firstName} {lastName}&apos;s profile</CardTitle>
      </CardHeader>
    </Card>
  );
}

