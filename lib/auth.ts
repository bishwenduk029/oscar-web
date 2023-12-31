import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  // huh any! I know.
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Decode the JWT token
      try {
        // Populate the session with the decoded JWT contents
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.subscription = token.subscription as any

        return session
      } catch (error) {
        console.error("Error decoding JWT:", error)
        // Handle error, e.g., by clearing the session or returning an empty session
        return session
      }
    },
    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email,
        },
        include: {
          subscriptions: true, // Include the subscriptions related to the user
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user?.id
        }
        return token
      }

      // Check if the user has an active subscription
      const activeSubscription = dbUser.subscriptions.find(
        (subscription) => subscription.status.toLowerCase() === "active"
      )

      if (activeSubscription) {
        // Add subscription details to the JWT token

        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
          subscription: {
            id: activeSubscription.id,
            name: activeSubscription.name,
            modelName: activeSubscription.modelName,
            status: activeSubscription.status,
            endsAt: activeSubscription.endsAt,
          },
        }
      } else {
        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          picture: dbUser.image,
          subscription: null, // Indicates no active paid subscription
        }
      }
    },
  },
}
