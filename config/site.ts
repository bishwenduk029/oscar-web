import { env } from "@/env.mjs"
import { SiteConfig } from "types"

const NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL

export const siteConfig: SiteConfig = {
  name: "OscarAI",
  description:
    "Empower your desktop with OscarAI, the writing assistant that keeps it local and private. Connect to a world-class language model right from your desktop and unlock a seamless, intuitive writing experience that’s exclusively yours.",
  url: `${NEXT_PUBLIC_APP_URL}/`,
  ogImage: `${NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    twitter: "https://www.youtube.com/channel/UCJB34bxHv_IQ6ItBdHe2Vpw",
    github: `${NEXT_PUBLIC_APP_URL}/`,
    email: "mailto:oscarai.copilot@gmail.com",
  },
}
