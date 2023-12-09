import { OpenAIStream } from "ai"
import { verify } from "jsonwebtoken"
import { PromptTemplate } from "langchain/prompts"
import OpenAI from "openai"

import { env } from "@/env.mjs"
import { db } from "@/lib/db"

const anyscaleAI = new OpenAI({
  baseURL: "https://api.endpoints.anyscale.com/v1",
  apiKey: env.ANYSCALE_API_KEY,
})

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
        id: promptID,
      },
    })

    const prompt = await PromptTemplate.fromTemplate(
      template?.prompt || "{content}"
    ).format({
      content,
    })

    const response = await anyscaleAI.completions.create({
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      prompt,
      temperature: 0.7,
      stream: true,
      max_tokens: 1024,
    })

    const stream = OpenAIStream(response, {})

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "X-Content-Type-Options": "nosniff",
      },
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
