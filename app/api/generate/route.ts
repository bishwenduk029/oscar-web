import { env } from "@/env.mjs"
import { verify } from "jsonwebtoken"

// The function name should directly correspond to the HTTP method
export async function POST(req: Request) {
  const { prompt } = await req.json() // Read the request body
  const authHeader = req.headers.get("authorization") // Use 'get' to retrieve headers

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "No token provided or invalid token format" }),
      { status: 401 }
    )
  }

  const token = authHeader.split(" ")[1]
  let decodedSession
  try {
    decodedSession = verify(token, env.NEXTAUTH_SECRET)
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
    })
  }

  if (
    !decodedSession.subscription ||
    decodedSession.subscription.status !== "ACTIVE"
  ) {
    return new Response(
      JSON.stringify({
        error: "Access denied. No active subscription found.",
      }),
      { status: 403 }
    )
  }

  try {
    const url = env.MODAL_PUBLIC_URL
    if (!url) {
      throw new Error(
        "MODAL_PUBLIC_URL is not defined in the environment variables."
      )
    }
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
    return new Response(JSON.stringify({ response: result }), { status: 200 })
  } catch (error) {
    console.error("API call failed:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    })
  }
}
