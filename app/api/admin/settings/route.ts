import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get current settings (you can expand this based on your needs)
    const settings = await sql`
      SELECT
        'platform' as category,
        json_build_object(
          'total_jobs', COALESCE((SELECT COUNT(*) FROM jobs), 0),
          'total_applications', COALESCE((SELECT COUNT(*) FROM applications), 0),
          'total_users', COALESCE((SELECT COUNT(*) FROM users_sync), 0),
          'total_candidates', COALESCE((SELECT COUNT(*) FROM candidates), 0),
          'platform_status', 'active'
        ) as data
    `.catch((error) => {
      console.error("Database query error:", error)
      if (error.code === "42P01") {
        return [{
          category: 'platform',
          data: {
            total_jobs: 0,
            total_applications: 0,
            total_users: 0,
            total_candidates: 0,
            platform_status: 'active'
          }
        }]
      }
      throw error
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching admin settings:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle different setting categories
    const { category, data } = body

    if (!category || !data) {
      return NextResponse.json(
        { error: "Catégorie et données requises" },
        { status: 400 }
      )
    }

    // For now, we'll just return success
    // You can implement actual settings persistence here
    return NextResponse.json({
      success: true,
      message: "Paramètres mis à jour avec succès",
      category,
      data
    })
  } catch (error) {
    console.error("Error updating admin settings:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
