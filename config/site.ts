import { env } from "@/env.mjs"
import { SiteConfig } from "types"

const NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL

export const siteConfig: SiteConfig = {
  name: "OscarAI",
  description:
    "Empower your writing with OscarAI, the private writing assistant that keeps it cool.",
  url: `${NEXT_PUBLIC_APP_URL}/`,
  ogImage: `${NEXT_PUBLIC_APP_URL}/opengraph-image.png`,
  links: {
    twitter: "https://www.youtube.com/channel/UCJB34bxHv_IQ6ItBdHe2Vpw",
    github: `${NEXT_PUBLIC_APP_URL}/`,
    email: "mailto:oscarai.copilot@gmail.com",
    privacy: `${NEXT_PUBLIC_APP_URL}/privacy`,
  },
}
