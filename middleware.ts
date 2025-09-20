import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add CSP headers to allow inline scripts
    const response = NextResponse.next()

    // Content Security Policy to allow inline scripts and other necessary resources
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss: ws:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    response.headers.set('Content-Security-Policy', cspHeader)

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public access to sign-in page, sign-up page, and static assets
        if (
          !token &&
          req.nextUrl.pathname !== "/sign-in" &&
          req.nextUrl.pathname !== "/sign-up" &&
          !req.nextUrl.pathname.startsWith("/_next")
        ) {
          return false
        }

        // Check role-based access
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "ADMIN"
        }

        // For other protected routes, just check if user is authenticated
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/api/applications", "/dashboard", "/profile", "/admin"]
}
