// pages/complete/[q].js
import { addAppSession } from "@/lib/session"

const CompletePage = async ({ searchParams }) => {
  const appSessionIsReady = await addAppSession(searchParams["appLoginID"])

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center text-2xl font-semibold tracking-tight">
      {appSessionIsReady ? (
        <div className="mx-auto">
          Completed sign-in. Please continue in app now
        </div>
      ) : (
        <div>Sign Failed!!! Sorry something went wrong</div>
      )}
    </div>
  )
}

export default CompletePage
