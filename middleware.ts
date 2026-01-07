import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdmin = token?.role === "ADMIN"
    const isAdminRoute = req.nextUrl.pathname.startsWith("/dashboard/admin")

    // Proteger rutas de admin
    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rutas públicas
        const publicRoutes = ["/login", "/recuperar-password"]
        if (publicRoutes.includes(req.nextUrl.pathname)) {
          return true
        }

        // Rutas protegidas requieren token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/((?!auth).*)",
  ],
}

