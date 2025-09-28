import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/database"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get notifications for the user
    const notifications = await sql`
      SELECT
        id,
        type,
        title,
        message,
        read,
        "createdAt" as created_at,
        job_id,
        application_id
      FROM notifications
      WHERE "userId" = ${session.user.id}
      ORDER BY "createdAt" DESC
      LIMIT 50
    `

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { type, title, message, job_id, application_id } = await request.json()

    const [notification] = await sql`
      INSERT INTO notifications ("userId", type, title, message, job_id, application_id)
      VALUES (${session.user.id}, ${type}, ${title}, ${message}, ${job_id || null}, ${application_id || null})
      RETURNING *
    `

    return NextResponse.json({ notification })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
