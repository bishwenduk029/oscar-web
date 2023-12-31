import Link from "next/link"

import { env } from "@/env.mjs"
import { getCurrentUser } from "@/lib/session"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export default async function PricingPage() {
  const user = await getCurrentUser()

  const getCheckoutLink = (user) => {
    if (user) {
      return `${env.NEXT_PUBLIC_LEMONSQUEEZY_API_CHECKOUT_URL}?checkout[custom][user_id]=${user.id}`
    }

    return "/login"
  }

  return (
    <section className="container flex flex-col  gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Simple, transparent pricing
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Monthly Pricing
        </p>
      </div>

      <div className="flex flex-row w-full transition-transform hover:scale-105">
        <div className="flex flex-col w-full">
          <div className="grid w-full items-start gap-10 rounded-md p-10 md:grid-cols-[1fr_200px] border-2 border-blue-200">
            <div className="grid gap-6">
              <h3 className="text-xl font-bold sm:text-2xl">
                Free Plan.
              </h3>
              <ul className="text-theme grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> 50 Edits
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> All editing features
                </li>

                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Custom Prompts
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Medium Accuracy
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h4 className="text-7xl font-bold">$0</h4>
                <p className="text-theme-alter text-sm font-medium">
                  No Credit Card Needed
                </p>
              </div>
              <Link
                href={getCheckoutLink(user)}
                className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
              >
                Enabled
              </Link>
            </div>
          </div>
          <div className="p-1 bg-blue-200"></div>
        </div>

        <div className="p-1 bg-blue-200"></div>
      </div>

      <div className="flex flex-row w-full transition-transform hover:scale-105">
        <div className="flex flex-col w-full">
          <div className="grid w-full items-start gap-10 rounded-md p-10 md:grid-cols-[1fr_200px] border-2 border-green-300">
            <div className="grid gap-6">
              <h3 className="text-xl font-bold sm:text-2xl">
                You have normal editing needs.
              </h3>
              <ul className="text-theme grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Unlimited Edits
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> All editing features
                </li>

                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Custom Prompts
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Medium Accuracy
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h4 className="text-7xl font-bold">$1.99</h4>
                <p className="text-theme-alter text-sm font-medium">
                  Billed Monthly
                </p>
              </div>
              <Link
                href={getCheckoutLink(user)}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="p-1 bg-green-300"></div>
        </div>

        <div className="p-1 bg-green-300"></div>
      </div>

      <div className="flex flex-row w-full transition-transform hover:scale-105">
        <div className="flex flex-col w-full">
          <div className="grid w-full items-start gap-10 rounded-md p-10 md:grid-cols-[1fr_200px] border-2 border-purple-300">
            <div className="grid gap-6">
              <h3 className="text-xl font-bold sm:text-2xl">
                You are a serious content editor.
              </h3>
              <ul className="text-theme grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Unlimited Edits
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> All editing features
                </li>

                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Custom Prompts
                </li>
                <li className="flex items-center">
                  <Icons.check className="mr-2 h-4 w-4" /> Higher Accuracy
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-4 text-center">
              <div>
                <h4 className="text-7xl font-bold">$5.99</h4>
                <p className="text-theme-alter text-sm font-medium">
                  Billed Monthly
                </p>
              </div>
              <Link
                href={getCheckoutLink(user)}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get Started
              </Link>
            </div>
          </div>
          <div className="p-1 bg-purple-300"></div>
        </div>

        <div className="p-1 bg-purple-300"></div>
      </div>

      <div className="mx-auto flex w-full max-w-[58rem] flex-col gap-4">
        <p className="text-theme max-w-[85%] leading-normal sm:leading-7">
          <strong>Amplify Your Productivity with OscarAI.</strong>
        </p>
      </div>
    </section>
  )
}
