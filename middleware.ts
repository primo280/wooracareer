import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware executed for protected routes
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
