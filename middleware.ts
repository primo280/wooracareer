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
        const pathname = req.nextUrl.pathname

        // Allow public access to sign-in page, sign-up page, and static assets
        if (
          !token &&
          pathname !== "/sign-in" &&
          pathname !== "/sign-up" &&
          !pathname.startsWith("/_next") &&
          !pathname.startsWith("/api/auth") &&
          !pathname.startsWith("/public")
        ) {
          return false
        }

        // Check role-based access for admin routes
        if (pathname.startsWith("/admin")) {
          const hasAdminRole = token?.role === "ADMIN"
          if (!hasAdminRole) {
            console.log("Access denied to admin route:", pathname, "User role:", token?.role)
          }
          return hasAdminRole
        }

        // For other protected routes, just check if user is authenticated
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/api/applications",
    "/api/admin/:path*",
    "/dashboard",
    "/profile",
    "/admin/:path*"
  ]
}
