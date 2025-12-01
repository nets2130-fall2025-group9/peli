import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createUser, deleteUser, updateUser } from "@/supabase/db";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;

    if (!id) {
      return new Response("Missing user ID", { status: 400 });
    }

    switch (evt.type) {
      case "user.created": {
        const { email_addresses, first_name, last_name } = evt.data;
        if (!email_addresses || !first_name || !last_name) {
          return new Response("Missing user data", { status: 400 });
        }

        await createUser(
          id,
          email_addresses[0].email_address,
          first_name,
          last_name
        );
        break;
      }
      case "user.updated": {
        const { email_addresses, first_name, last_name } = evt.data;
        if (!email_addresses || !first_name || !last_name) {
          return new Response("Missing user data", { status: 400 });
        }

        await updateUser(
          id,
          email_addresses[0].email_address,
          first_name,
          last_name
        );
        break;
      }
      case "user.deleted":
        await deleteUser(id);
        break;
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}
