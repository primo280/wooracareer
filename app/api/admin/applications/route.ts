import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const applications = await sql`
      SELECT
        a.id,
        a."jobId",
        a."candidateId",
        a."coverLetter",
        a.status,
        a."appliedAt" as applied_at,
        a."updatedAt",
        j.title as job_title,
        c."firstName" || ' ' || c."lastName" as candidate_name,
        u.email as candidate_email
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      JOIN candidates c ON a."candidateId" = c.id
      JOIN users_sync u ON c."userId" = u.id
      ORDER BY a."appliedAt" DESC
    `.catch((error) => {
      console.error("Database query error:", error)
      // Return empty array if table doesn't exist yet
      if (error.code === "42P01") {
        return []
      }
      throw error
    })

    return NextResponse.json({ applications }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error("Error fetching admin applications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
