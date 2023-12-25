import { NextResponse } from "next/server"

import { db } from "@/lib/db"

const categories = {
  oscar_edit: "Quick Edit",
  oscar_tone: "Change Tone",
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*", // Or specify a specific domain
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  })

  const promptId = params.slug.trim()
  console.log(promptId)

  try {
    const prompt = await db.prompt.findUnique({
      where: { id: promptId },
      select: {
        id: true,
        title: true,
        category: true,
        prompt: true,
        isTemplateEditable: true,
        icon: true,
      },
    })
    console.log(prompt)

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt not found" },
        { headers, status: 404 }
      )
    }

    const promptWithCategory = {
      ...prompt,
      categoryTitle: categories[prompt.category],
    }

    return NextResponse.json(
      { prompt: promptWithCategory },
      { headers, status: 200 }
    )
  } catch (error) {
    console.error("Request error", error)
    return NextResponse.json(
      { error: "Error fetching prompt" },
      { headers, status: 500 }
    )
  }
}
