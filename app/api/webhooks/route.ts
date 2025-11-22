import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const supabase = createAdminSupabaseClient();

    switch (evt.type) {
      case "user.created":
        await supabase.from("user").insert({
          id,
          email: evt.data.email_addresses[0].email_address,
          first_name: evt.data.first_name,
          last_name: evt.data.last_name,
        });
        break;
      case "user.updated":
        await supabase
          .from("user")
          .update({
            email: evt.data.email_addresses[0].email_address,
            first_name: evt.data.first_name,
            last_name: evt.data.last_name,
          })
          .eq("id", id);
        break;
      case "user.deleted":
        await supabase.from("user").delete().eq("id", id);
        break;
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }
}
