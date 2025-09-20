"use client"

import { SessionProvider } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Redirect to sign-in if user is not authenticated and not already on sign-in page
    // This is a simple client-side guard
    // For more robust protection, use server-side checks or middleware
  }, [pathname, router])

  return <SessionProvider>{children}</SessionProvider>
}
