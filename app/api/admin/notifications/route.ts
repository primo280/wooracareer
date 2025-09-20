import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const notifications = await sql`
      SELECT
        n.*,
        u.email as user_email,
        u.name as user_name
      FROM notifications n
      JOIN users_sync u ON n."userId" = u.id
      ORDER BY n."createdAt" DESC
      LIMIT 100
    `.catch((error) => {
      console.error("Database query error:", error)
      // Return empty array if table doesn't exist yet
      if (error.code === "42P01") {
        return []
      }
      throw error
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching admin notifications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { userId, type, title, message } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    const notification = await sql`
      INSERT INTO notifications ("userId", type, title, message, read, "createdAt")
      VALUES (${userId}, ${type}, ${title}, ${message}, false, NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, notification: notification[0] })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
