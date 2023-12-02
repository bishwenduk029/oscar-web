import { NextResponse } from "next/server"

import { db } from "@/lib/db"

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

    return NextResponse.json({ prompts }, { headers, status: 200 })
  } catch (error) {
    console.error("Request error", error)
    NextResponse.json(
      { error: "Error fetching prompts" },
      { headers, status: 500 }
    )
  }
}
