import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    // This is optional because it's only used in development.
    // See https://next-auth.js.org/deployment.
    NEXTAUTH_URL: z.string().url().optional(),
    MODAL_PUBLIC_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(0),
    LEMONSQUEEZY_API_KEY: z.string().min(0),
    LEMONSQUEEZY_STORE_ID: z.string().min(0),
    LEMONSQUEEZY_WEBHOOK_SECRET: z.string().min(1),
    ANYSCALE_API_KEY: z.string().min(1),
    ANYSCALE_API_URL: z.string().min(1),
    ANYSCALE_MODEL: z.string().min(1),
    EMAIL_SERVER_HOST: z.string().min(1),
    EMAIL_SERVER_PORT: z.string().min(1),
    EMAIL_SERVER_USER: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_LEMONSQUEEZY_API_CHECKOUT_URL: z.string().url().min(1),
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().min(1),
  },
  runtimeEnv: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    MODAL_PUBLIC_URL: process.env.MODAL_PUBLIC_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
    LEMONSQUEEZY_STORE_ID: process.env.LEMONSQUEEZY_STORE_ID,
    LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_LEMONSQUEEZY_API_CHECKOUT_URL:
      process.env.NEXT_PUBLIC_LEMONSQUEEZY_API_CHECKOUT_URL,
    ANYSCALE_API_KEY: process.env.ANYSCALE_API_KEY,
    ANYSCALE_API_URL: process.env.ANYSCALE_API_URL,
    ANYSCALE_MODEL: process.env.ANYSCALE_MODEL,
    NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
})
