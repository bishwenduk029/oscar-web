// pages/complete/[q].js

import Link from "next/link"
import { v4 as uuidv4 } from "uuid"

import { addAppSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const CompletePage = async ({ searchParams }) => {
  const randomGUID = uuidv4()
  const appSessionIsReady = await addAppSession(
    searchParams["appLoginID"] || randomGUID
  )

  console.log(searchParams["appLoginID"])

  // Check for a valid appLoginID
  const hasValidAppLoginID =
    searchParams["appLoginID"] && searchParams["appLoginID"].trim() !== "null"

  const renderContent = () => {
    if (!appSessionIsReady) {
      return <div>Sign Failed!!! Sorry something went wrong</div>
    }
    console.log(hasValidAppLoginID, searchParams["appLoginID"])

    if (hasValidAppLoginID) {
      return (
        <span>
          {`Completed sign-in. Please copy this token ${searchParams["appLoginID"]} for use in the chrome extension`}
        </span>
      )
    }

    return (
      <>
        Completed sign-in. Return
        <Link
          href="/pricing"
          className={cn(buttonVariants({ variant: "link" }), "ml-1 text-xl")}
        >
          👉 Home 👈
        </Link>
      </>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center text-2xl font-semibold tracking-tight">
      <div className="mx-auto">{renderContent()}</div>
    </div>
  )
}

export default CompletePage
