import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]/route"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)

    await sql`
      UPDATE notifications
      SET read = true, "updatedAt" = NOW()
      WHERE id = ${notificationId} AND "userId" = ${session.user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
