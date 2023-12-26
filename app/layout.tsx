import { Fraunces as FontSans } from "next/font/google"
import localFont from "next/font/local"

import "@/styles/globals.css"
import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { absoluteUrl, cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { TailwindIndicator } from "@/components/tailwind-indicator"

import { Providers } from "./provider"

const fontSans = FontSans({
  subsets: ["latin"],
  weight: "300", // or any other weight you need
  variable: "--font-sans",
});


const NEXT_PUBLIC_APP_URL = env.NEXT_PUBLIC_APP_URL

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Autopilot",
    "AI",
    "Co-pilot",
    "Writing assistant",
    "Writing Co-pilot",
    "AI Writing Assistant",
    "Content Creation Tool",
    "AI for Content Writers",
    "Autopilot Writing Software",
    "Creative Writing AI",
    "AI-Powered Content Generation",
    "Automated Writing Co-pilot",
    "AI Content Optimization",
    "SEO-Friendly Writing Assistant",
    "Artificial Intelligence for Writers",
    "ChatGPT-Alternative Writing Assistant",
    "GPT-4 alternative",
    "ChatGPT alternative",
    "Advanced AI Writing Software",
    "Next-Gen AI for Content Creation",
  ],
  authors: [
    {
      name: "Sayanti",
      url: `${NEXT_PUBLIC_APP_URL}/`,
    },
  ],
  creator: "Sayanti",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "@shadcn",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Providers>
          {children}
          <Analytics />
          <Toaster />
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  )
}
