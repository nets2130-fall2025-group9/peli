import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createUser, deleteUser, updateUser } from "@/supabase/db";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;

    switch (evt.type) {
      case "user.created":
        await createUser(
          id,
          evt.data.email_addresses[0].email_address,
          evt.data.first_name,
          evt.data.last_name
        );
        break;
      case "user.updated":
        await updateUser(
          id,
          evt.data.email_addresses[0].email_address,
          evt.data.first_name,
          evt.data.last_name
        );
        break;
      case "user.deleted":
        await deleteUser(id);
        break;
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}
