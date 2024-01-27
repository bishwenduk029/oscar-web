import { env } from "env.mjs"
import { getServerSession } from "next-auth"
import OpenAI from "openai"

import { authOptions } from "@/lib/auth"

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export async function POST(req: Request, res: Response) {
  const decodedSession = getServerSession(authOptions)

  if (!decodedSession) {
    return new Response(JSON.stringify({ error: "Not Authorized" }), {
      status: 401,
    })
  }

  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })

  const formData = await req.formData()

  try {
    // Create transcription from a video file
    const transcriptionResponse = await openai.audio.transcriptions.create({
      // @ts-ignore
      file: formData.get("audio"),
      model: "whisper-1",
      language: "en",
    })

    const transcript = transcriptionResponse?.text

    // Perform content moderation check on the transcript
    const moderationResponse = await openai.moderations.create({
      input: transcript,
    })

    // Check if the content is flagged as inappropriate
    if (moderationResponse?.results[0]?.flagged) {
      return new Response(
        JSON.stringify({
          error: "Inappropriate content detected. Please try again.",
        }),
        {
          headers,
          status: 200,
        }
      )
    }

    // Return the transcript if no inappropriate content is detected
    return new Response(JSON.stringify({ transcript }), {
      headers,
      status: 200,
    })
  } catch (error) {
    console.error("server error", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers,
      status: 500,
    })
  }
}
