import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await sql`
      UPDATE notifications
      SET read = true, updated_at = NOW()
      WHERE user_id = ${session.user.email} AND read = false
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
