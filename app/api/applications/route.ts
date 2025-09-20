import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/database"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"

export const dynamic = "force-dynamic"

const applicationSchema = z.object({
  job_id: z.number().int().positive(),
  cover_letter: z.string().max(1000).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("POST /api/applications session:", session)
    if (!session?.user) {
      console.log("Unauthorized access attempt to POST /api/applications")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()

    // Validate request body with Zod
    const parseResult = applicationSchema.safeParse(body)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: `Données invalides: ${errors}` }, { status: 400 })
    }

    const { job_id, cover_letter } = parseResult.data

    // Get or create candidate profile
    let candidate = await sql`
      SELECT id FROM candidates WHERE "userId" = ${session.user.email}
    `
    console.log("Candidate query result:", candidate)

    if (candidate.length === 0) {
      // Create candidate profile
      candidate = await sql`
        INSERT INTO candidates ("userId", first_name, last_name)
        VALUES (${session.user.email}, ${session.user.name?.split(" ")[0] || ""}, ${session.user.name?.split(" ")[1] || ""})
        RETURNING id
      `
      console.log("Created new candidate profile:", candidate)
    }

    const candidateId = candidate[0].id

    // Check if already applied
    const existingApplication = await sql`
      SELECT id FROM applications 
      WHERE job_id = ${job_id} AND candidate_id = ${candidateId}
    `
    console.log("Existing application check:", existingApplication)

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: "Vous avez déjà postulé à cette offre" }, { status: 400 })
    }

    // Create application
    const application = await sql`
      INSERT INTO applications (job_id, candidate_id, cover_letter, status)
      VALUES (${job_id}, ${candidateId}, ${cover_letter}, 'pending')
      RETURNING *
    `
    console.log("Created application:", application)

    return NextResponse.json({ success: true, application: application[0] })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("GET /api/applications session:", session)
    if (!session?.user) {
      console.log("Unauthorized access attempt to GET /api/applications")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get candidate applications with job details
    const applications = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j.company,
        j.location,
        j.type,
        j.salary_min,
        j.salary_max
      FROM applications a
      JOIN candidates c ON a.candidate_id = c.id
      JOIN jobs j ON a.job_id = j.id
      WHERE c."userId" = ${session.user.email}
      ORDER BY a.applied_at DESC
    `
    console.log("Fetched applications:", applications)

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
