import { getServerSession } from "next-auth/next"
import { db } from "@/lib/db"

import { authOptions } from "@/lib/auth"
import { sign, verify } from "jsonwebtoken"

import { env } from "@/env.mjs"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  return session?.user
}

export async function addAppSession(uuid: string) {
  try {
    const session = await getServerSession(authOptions)
    if (session && uuid) {
      // Check if the session with this UUID already exists
      const existingSession = await db.session.findUnique({
        where: { id: uuid },
      })

      // If the session does not exist, create it
      if (!existingSession) {
        const newJWT = sign({ ...session }, process.env.NEXTAUTH_SECRET) // Access environment variables with process.env
        await db.session.create({
          data: {
            userId: session.user.id,
            id: uuid,
            sessionToken: newJWT,
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          },
        })
      }
      // If it exists, do nothing
    }

    // Return true to indicate the operation was successful, even if no creation occurred
    return true
  } catch (error) {
    console.error("Failed to add app session:", error)
    return false
  }
}
