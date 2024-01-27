import { OpenAIStream, StreamingTextResponse } from "ai"
import { verify } from "jsonwebtoken"
import { PromptTemplate } from "langchain/prompts"
import { getServerSession } from "next-auth"
import OpenAI from "openai"

import { env } from "@/env.mjs"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const anyscaleAI = new OpenAI({
  baseURL: env.ANYSCALE_API_URL,
  apiKey: env.ANYSCALE_API_KEY,
})

// The function name should directly correspond to the HTTP method
export async function POST(req: Request, res: Response) {
  const decodedSession = await getServerSession(authOptions)
  let { prompt, promptID } = await req.json()
  let defaultSubscription: any = null

  if (!decodedSession) {
    return new Response(JSON.stringify({ error: "Not Authorized" }), {
      status: 401,
    })
  }

  let model = "mistralai/Mistral-7B-Instruct-v0.1"

  if (
    decodedSession.user.subscription &&
    decodedSession.user.subscription.status === "active"
  ) {
    model = decodedSession.user.subscription?.modelName
  }

  if (
    !decodedSession.user.subscription ||
    decodedSession.user.subscription.status !== "active"
  ) {
    defaultSubscription = await db.subscription.findFirst({
      where: {
        userId: decodedSession.user.id,
        status: "default",
      },
    })

    if (!defaultSubscription) {
      // Create a new subscription with endsAt of 30 days from now
      const randomInteger = generateRandomIntegerOfLength(7)
      const subscriptionData = {
        lemonSqueezyId: randomInteger,
        orderId: randomInteger + 1,
        name: decodedSession.user.name,
        email: decodedSession.user.email,
        modelName: "mistralai/Mistral-7B-Instruct-v0.1",
        status: "default",
        renewsAt: null,
        endsAt: new Date(new Date().setDate(new Date().getDate() + 30)),
        price: 0, // Assuming price is linked to price_id of the first subscription item
        planId: 1, // Assuming product_id corresponds to the planId
        userId: decodedSession.user.id, // Custom user ID passed in the meta
        isUsageBased: false,
      }
      defaultSubscription = await db.subscription.create({
        // @ts-ignore
        data: subscriptionData,
      })
    }

    // Check if today's date is earlier or equal to endsAt of subscription
    if (new Date() <= new Date(defaultSubscription.endsAt || "")) {
      // Check for the editCount, if editCount === 500, then exit
      if (defaultSubscription.editsCount === 50) {
        return new Response(JSON.stringify({ error: "Edit limit reached" }), {
          status: 403,
        })
      }
    } else {
      // Update renewal_date to 30 days from today and set editCount = 0
      await db.subscription.update({
        where: {
          id: defaultSubscription.id,
        },
        data: {
          renewsAt: new Date(new Date().setDate(new Date().getDate() + 30)),
          editsCount: 0,
        },
      })
    }
  }

  try {

    if (promptID) {
      const template = await db.prompt.findUnique({
        where: {
          id: promptID,
        },
      })

      prompt = await PromptTemplate.fromTemplate(template?.prompt || "").format(
        {
          content: prompt,
        }
      )
    }

    // console.log("Model being used", model)
    // console.log("Prompt being used", prompt)

    const response = await anyscaleAI.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are OscarAI, a highly experienced and proficient content writer. As helpful writing assistant, try to complete the content editing or writing tasks provided by the user. Do not give any explanations, just complete the task",
        },
        {
          role: "user",
          content: `Your task is: ${prompt}`,
        },
      ],
      temperature: 0.7,
      stream: true,
    })

    // TODO: update the editsCount in subscriptions for the given user by 1 and then pass it in the header response below.

    const stream = OpenAIStream(response, {})

    if (defaultSubscription) {
      let subscription = await db.subscription.update({
        where: {
          id: defaultSubscription.id,
        },
        data: {
          editsCount: defaultSubscription.editsCount + 1,
        },
      })
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "X-Content-Type-Options": "nosniff",
          "X-Edits-Count": subscription
            ? subscription.editsCount.toString()
            : "0",
        },
      })
    }

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error("API call failed:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
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

function generateRandomIntegerOfLength(length) {
  const min = Math.pow(10, length - 1) // Minimum number with 'length' digits
  const max = Math.pow(10, length) - 1 // Maximum number with 'length' digits

  if (min > Number.MAX_SAFE_INTEGER || max > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      "Requested length exceeds the maximum safe integer size in JavaScript"
    )
  }

  return Math.floor(Math.random() * (max - min + 1)) + min
}
