import { NextResponse } from "next/server"

import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })

  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers, status: 204 })
  }

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
          headers,
          status: 404,
        })
      }

      // Return the sessionToken
      return new Response(
        JSON.stringify({ sessionToken: session.sessionToken }),
        { headers }
      )
    } catch (error) {
      // Handle any errors
      console.error(error)
      return new Response(
        JSON.stringify({ message: "Internal server error" }),
        { headers, status: 500 }
      )
    }
  } else {
    // If the request is not a GET request, return a 405 Method Not Allowed
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      headers,
      status: 405,
    })
  }
}
