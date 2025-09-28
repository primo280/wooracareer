import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)

    if (isNaN(notificationId)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    // Delete the notification, ensuring it belongs to the user
    const result = await sql`
      DELETE FROM notifications
      WHERE id = ${notificationId} AND "userId" = ${session.user.id}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Notification non trouvée" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
