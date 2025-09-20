import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get calendar events (jobs expiring, applications, etc.)
    const events = await sql`
      SELECT
        'job_expiry' as type,
        j.title as title,
        j."expiresAt" as date,
        'Job expires' as description,
        'warning' as priority
      FROM jobs j
      WHERE j."expiresAt" IS NOT NULL

      UNION ALL

      SELECT
        'application_deadline' as type,
        j.title as title,
        a."appliedAt" as date,
        'Application received' as description,
        'info' as priority
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."appliedAt" IS NOT NULL

      UNION ALL

      SELECT
        'job_created' as type,
        j.title as title,
        j."createdAt" as date,
        'New job posted' as description,
        'success' as priority
      FROM jobs j
      WHERE j."createdAt" IS NOT NULL

      ORDER BY date DESC
      LIMIT 100
    `.catch((error) => {
      console.error("Database query error:", error)
      if (error.code === "42P01") {
        return []
      }
      throw error
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching admin calendar:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { title, description, date, type, priority } = body

    if (!title || !date || !type) {
      return NextResponse.json(
        { error: "Titre, date et type sont requis" },
        { status: 400 }
      )
    }

    // For now, we'll just return success
    // You can implement actual calendar event storage here
    const event = {
      id: Date.now(),
      title,
      description: description || '',
      date,
      type: type || 'general',
      priority: priority || 'info'
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
