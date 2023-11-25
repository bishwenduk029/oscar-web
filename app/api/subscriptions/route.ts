import crypto from "crypto"
import { z } from "zod"

import { env } from "@/env.mjs"
import { db } from "@/lib/db"

// New schema for webhook payload
const subscriptionAttributesSchema = z.object({
  // Assuming all fields are required unless explicitly marked as optional
  urls: z.object({
    customer_portal: z.string().url(),
    update_payment_method: z.string().url(),
  }),
  pause: z.any().optional(), // 'null' or other types could be expected here
  status: z.string(),
  ends_at: z.string().nullable().optional(),
  order_id: z.number(),
  store_id: z.number(),
  cancelled: z.boolean(),
  renews_at: z.string().optional(),
  test_mode: z.boolean(),
  user_name: z.string(),
  card_brand: z.string().optional(),
  created_at: z.string(),
  product_id: z.number(),
  updated_at: z.string(),
  user_email: z.string().email(),
  variant_id: z.number(),
  customer_id: z.number(),
  product_name: z.string().optional(),
  variant_name: z.string().optional(),
  order_item_id: z.number(),
  trial_ends_at: z.string().nullable().optional(),
  billing_anchor: z.number().optional(),
  card_last_four: z.string().optional(),
  status_formatted: z.string().optional(),
  first_subscription_item: z
    .object({
      id: z.number(),
      price_id: z.number(),
      quantity: z.number(),
      created_at: z.string(),
      updated_at: z.string(),
      is_usage_based: z.boolean(),
      subscription_id: z.number(),
    })
    .optional(),
  // Any other nested objects or arrays should be defined here as well
})

const webhookPayloadSchema = z.object({
  data: z.object({
    id: z.string(),
    type: z.string(),
    links: z.object({
      self: z.string().url(),
    }),
    attributes: subscriptionAttributesSchema,
    // Define relationships or other nested structures if necessary
    relationships: z
      .record(
        z.object({
          links: z.object({
            self: z.string().url(),
            related: z.string().url(),
          }),
        })
      )
      .optional(),
  }),
  meta: z.object({
    test_mode: z.boolean(),
    event_name: z.string(),
    webhook_id: z.string(),
    custom_data: z.object({
      user_id: z.string(),
    }),
  }),
})

export async function POST(req: Request) {
  const SIGNING_SECRET = env.LEMONSQUEEZY_WEBHOOK_SECRET
  console.log(req.headers, req.url)
  // Calculate hash to validate signature
  const signature: any = req.headers.get("x-Signature")
  const payload = await req.json()
  console.log(payload)
  const hash = crypto
    .createHmac("sha256", SIGNING_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex")

  if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
    console.log("Oops the signing secret is not matching for some reason")
  }

  const { data, meta } = webhookPayloadSchema.parse(payload)
  const userId = meta.custom_data.user_id

  // Log the event before processing
  const webhookEvent = await db.webhookEvent.create({
    data: {
      eventName: meta.event_name,
      body: payload,
    },
  })
  try {
    // Handle different event types
    const eventType = meta.event_name
    console.log(webhookEvent)
    switch (eventType) {
      case "subscription_created":
        // Lookup user by userId provided in the custom_data
        const user = await db.user.findUnique({
          where: { id: userId },
        })
        if (!user) {
          throw new Error("User not found.")
        }

        // Extract relevant subscription data from the payload
        const subscriptionData = {
          lemonSqueezyId: parseInt(data.id),
          orderId: data.attributes.order_id,
          name: data.attributes.user_name,
          email: data.attributes.user_email,
          status: data.attributes.status,
          renewsAt: data.attributes.renews_at
            ? new Date(data.attributes.renews_at)
            : null,
          endsAt: data.attributes.ends_at
            ? new Date(data.attributes.ends_at)
            : null,
          trialEndsAt: data.attributes.trial_ends_at
            ? new Date(data.attributes.trial_ends_at)
            : null,
          price: data.attributes.first_subscription_item
            ? data.attributes.first_subscription_item.price_id
            : 0, // Assuming price is linked to price_id of the first subscription item
          planId: data.attributes.product_id, // Assuming product_id corresponds to the planId
          userId: meta.custom_data.user_id, // Custom user ID passed in the meta
          isUsageBased: data.attributes.first_subscription_item
            ? data.attributes.first_subscription_item.is_usage_based
            : false,
          subscriptionItemId: data.attributes.first_subscription_item?.id,
        }

        // Now let's create the subscription in the database
        await db.subscription.create({
          data: subscriptionData,
        })

        // Update webhook event as processed
        await db.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { processed: true },
        })

        return new Response(null, { status: 200 })

      default:
        return new Response(null, { status: 400 })
    }
  } catch (error) {
    // Handle errors
    console.log(error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}
