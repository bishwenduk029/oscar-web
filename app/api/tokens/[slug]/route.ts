import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  if (req.method === "GET") {
    try {
      const appSessionID = params.slug // Retrieve the session ID from the path parameter

      // Find the session with the given ID
      const session = await db.session.findUnique({
        where: {
          id: appSessionID,
        },
        select: {
          sessionToken: true, // Select only the sessionToken to return
        },
      })

      // If the session is not found, return a 404
      if (!session) {
        return new Response(JSON.stringify({ message: "Session not found" }), {
          status: 404,
        })
      }

      // Return the sessionToken
      return new Response(
        JSON.stringify({ sessionToken: session.sessionToken })
      )
    } catch (error) {
      // Handle any errors
      console.error(error)
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        { status: 500 }
      )
    }
  } else {
    // If the request is not a GET request, return a 405 Method Not Allowed
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
    })
  }
}
