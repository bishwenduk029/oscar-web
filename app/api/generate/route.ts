import { verify } from "jsonwebtoken"

import { env } from "@/env.mjs"
import { db } from "@/lib/db"

// The function name should directly correspond to the HTTP method
export async function POST(req: Request) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })

  const { promptID, content } = await req.json() // Read the request body
  const authHeader = req.headers.get("authorization") // Use 'get' to retrieve headers

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "No token provided or invalid token format" }),
      { headers, status: 401 }
    )
  }

  const token = authHeader.split(" ")[1]
  let decodedSession
  try {
    decodedSession = verify(token, env.NEXTAUTH_SECRET)
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      headers,
      status: 401,
    })
  }

  if (
    !decodedSession.user.subscription ||
    decodedSession.user.subscription.status !== "active"
  ) {
    return new Response(
      JSON.stringify({
        error: "Access denied. No active subscription found.",
      }),
      { headers, status: 403 }
    )
  }

  try {
    const url = env.MODAL_PUBLIC_URL
    if (!url) {
      throw new Error(
        "MODAL_PUBLIC_URL is not defined in the environment variables."
      )
    }

    const template = await db.prompt.findUnique({
      where: {
        id: promptID
      }
    })

    const prompt = template?.prompt.replace('${content}', content);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return new Response(JSON.stringify({ response: result }), {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error("API call failed:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers,
      status: 500,
    })
  }
}

// Separate OPTIONS handler
export async function OPTIONS(req: Request) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })

  return new Response(null, { headers, status: 204 })
}
