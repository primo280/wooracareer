import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized - Admin role required" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Admin authentication working correctly",
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Admin test endpoint error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
