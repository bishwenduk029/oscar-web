// pages/api/updateSubscriptionStatus.js

import { z } from 'zod';
import { db } from "@/lib/db"
import crypto from "crypto"
import { env } from 'process';

const subscriptionUpdateSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      status: z.string(),
    }),
  }),
  meta: z.object({
    event_name: z.enum([
      "subscription_updated",
      "subscription_cancelled",
      "subscription_resumed",
      "subscription_expired",
      "subscription_paused",
      "subscription_unpaused",
    ]),
  }),
});

export default async function POST(req: Request) {
  const SIGNING_SECRET = env.LEMONSQUEEZY_WEBHOOK_SECRET || ""
  // Calculate hash to validate signature
  const signature: any = req.headers.get("x-signature")
  const payload = await req.json()
  const hash = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(payload)
    .digest("hex")

  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    throw new Error("Invalid signature.")
  }

  try {
    const { data, meta } = subscriptionUpdateSchema.parse(req.body);
    const lemonSqueezyId = parseInt(data.id);
    const status = data.attributes.status;
    const eventType = meta.event_name;

    if (subscriptionUpdateSchema.shape.meta.shape.event_name.options.includes(eventType)) {
      const subscription = await db.subscription.update({
        where: { lemonSqueezyId },
        data: { status },
      });

      return new Response(JSON.stringify(subscription), { status: 200 });
    } else {
      return new Response(JSON.stringify({ message: 'Event type does not require status update.' }), { status: 400 });
    }
  } catch (error) {
    console.error('Request error', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
