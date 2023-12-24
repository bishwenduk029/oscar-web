import { NextResponse } from "next/server"

import { db } from "@/lib/db"

const categories = {
  oscar_edit: "Quick Edit",
  oscar_tone: "Change Tone",
}

export async function GET(req: Request) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })
  try {
    const prompts = await db.prompt.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        icon: true,
      },
    })

    const promptsWithCatagories = prompts.map((prompt) => ({
      ...prompt,
      categoryTitle: categories[prompt.category],
    }))

    return NextResponse.json(
      { prompts: promptsWithCatagories },
      { headers, status: 200 }
    )
  } catch (error) {
    console.error("Request error", error)
    NextResponse.json(
      { error: "Error fetching prompts" },
      { headers, status: 500 }
    )
  }
}
