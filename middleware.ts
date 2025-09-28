import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add CSP headers to allow inline scripts
    const response = NextResponse.next()

    // Content Security Policy to allow inline scripts and other necessary resources
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://*.vercel.app https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://*.vercel.app",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://*.vercel.app",
      "connect-src 'self' https: wss: ws: https://*.vercel.app https://vercel.live",
      "frame-src 'self' https://*.vercel.app",
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

        // Allow public access to sign-in page, sign-up page, job applications, and static assets
        if (
          !token &&
          pathname !== "/sign-in" &&
          pathname !== "/sign-up" &&
          pathname !== "/api/applications" &&
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

        // Allow unauthenticated access to job applications
        if (pathname === "/api/applications") {
          return true
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
    "/dashboard",
    "/profile",
    "/admin/:path*"
  ]
}
