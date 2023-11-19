import { z } from "zod"
import { db } from "@/lib/db"

// New schema for webhook payload
const webhookPayloadSchema = z.object({
  eventType: z.enum([
    "subscription_created",
    "subscription_payment_success",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_resumed",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
    "subscription_payment_failed",
  ]),
  eventData: z.object({
    lemonSqueezyId: z.number(),
    orderId: z.number(),
    name: z.string(),
    email: z.string(),
    status: z.string(),
    renewsAt: z.date().optional(),
    endsAt: z.date().optional(),
    trialEndsAt: z.date().optional(),
    resumesAt: z.date().optional(),
    price: z.number(),
    planId: z.number(),
    userId: z.string(),
  }),
})

export async function POST(req: Request) {
  try {
    // Authenticate the request using your method (e.g., validate webhook signature)

    // Parse and validate the request body
    const payload = await req.json()
    const { eventType, eventData } = webhookPayloadSchema.parse(payload)

    // Handle different event types
    switch (eventType) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_cancelled":
      case "subscription_resumed":
      case "subscription_expired":
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_payment_failed":
      case "subscription_payment_success":
        // Lookup user by email
        const user = await db.user.findUnique({
          where: { email: eventData.email },
        })
        if (!user) {
          throw new Error("User not found")
        }

        // Update or create subscription record
        await db.subscription.upsert({
          where: { lemonSqueezyId: eventData.lemonSqueezyId },
          update: eventData,
          create: { ...eventData, userId: user.id },
        })

        return new Response(null, { status: 200 })

      default:
        return new Response(null, { status: 400 })
    }
  } catch (error) {
    // Handle errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    })
  }
}
