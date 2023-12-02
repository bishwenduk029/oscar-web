import { NextResponse } from "next/server"

import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const prompts = await db.prompt.findMany()
    return NextResponse.json({ prompts }, { status: 200 })
  } catch (error) {
    console.error("Request error", error)
    NextResponse.json({ error: "Error fetching prompts" }, { status: 500 })
  }
}
