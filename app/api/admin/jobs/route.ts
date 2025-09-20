import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"
import { createJobSchema, type CreateJobInput } from "./schema"

export async function GET(request: NextRequest) {
  try {
    const jobs = await sql`
      SELECT
        j.*,
        COUNT(a.id) as applications
      FROM jobs j
      LEFT JOIN applications a ON j.id = a."jobId"
      GROUP BY j.id
      ORDER BY j."createdAt" DESC
    `

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching admin jobs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = createJobSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      )
    }

    const jobData: CreateJobInput = validationResult.data

    const job = await sql`
      INSERT INTO jobs (
        title, company, location, type, "salaryMin", "salaryMax",
        description, requirements, benefits, tags, "expiresAt", status
      )
      VALUES (
        ${jobData.title}, ${jobData.company}, ${jobData.location}, ${jobData.type},
        ${jobData.salaryMin}, ${jobData.salaryMax}, ${jobData.description},
        ${jobData.requirements}, ${jobData.benefits}, ${jobData.tags},
        ${jobData.expiresAt}, 'active'
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, job: job[0] })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
