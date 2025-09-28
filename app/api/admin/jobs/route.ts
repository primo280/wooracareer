import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"
import { createJobSchema, updateJobSchema, type CreateJobInput, type UpdateJobInput } from "./schema"

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
        description, requirements, benefits, tags, "expiresAt", status, "updatedAt"
      )
      VALUES (
        ${jobData.title}, ${jobData.company}, ${jobData.location}, ${jobData.type},
        ${jobData.salaryMin}, ${jobData.salaryMax}, ${jobData.description},
        ${jobData.requirements}, ${jobData.benefits}, ${jobData.tags},
        ${jobData.expiresAt}, 'active', NOW()
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, job: job[0] })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validationResult = updateJobSchema.safeParse(body)
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

    const jobData: UpdateJobInput = validationResult.data
    const { id, ...updateFields } = jobData

    // Check if job exists
    const existingJob = await sql`SELECT * FROM jobs WHERE id = ${id}`
    if (existingJob.length === 0) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 })
    }

    // Build update object
    const updateData: any = { updatedAt: new Date() }

    if (updateFields.title !== undefined) updateData.title = updateFields.title
    if (updateFields.company !== undefined) updateData.company = updateFields.company
    if (updateFields.location !== undefined) updateData.location = updateFields.location
    if (updateFields.type !== undefined) updateData.type = updateFields.type
    if (updateFields.salaryMin !== undefined) updateData.salaryMin = updateFields.salaryMin
    if (updateFields.salaryMax !== undefined) updateData.salaryMax = updateFields.salaryMax
    if (updateFields.description !== undefined) updateData.description = updateFields.description
    if (updateFields.requirements !== undefined) updateData.requirements = updateFields.requirements
    if (updateFields.benefits !== undefined) updateData.benefits = updateFields.benefits
    if (updateFields.tags !== undefined) updateData.tags = updateFields.tags
    if (updateFields.status !== undefined) updateData.status = updateFields.status
    if (updateFields.expiresAt !== undefined) updateData.expiresAt = updateFields.expiresAt

    // Update the job
    const result = await sql`
      UPDATE jobs SET
        title = ${updateData.title ?? existingJob[0].title},
        company = ${updateData.company ?? existingJob[0].company},
        location = ${updateData.location ?? existingJob[0].location},
        type = ${updateData.type ?? existingJob[0].type},
        "salaryMin" = ${updateData.salaryMin ?? existingJob[0].salaryMin},
        "salaryMax" = ${updateData.salaryMax ?? existingJob[0].salaryMax},
        description = ${updateData.description ?? existingJob[0].description},
        requirements = ${updateData.requirements ?? existingJob[0].requirements},
        benefits = ${updateData.benefits ?? existingJob[0].benefits},
        tags = ${updateData.tags ?? existingJob[0].tags},
        status = ${updateData.status ?? existingJob[0].status},
        "expiresAt" = ${updateData.expiresAt ?? existingJob[0].expiresAt},
        "updatedAt" = ${updateData.updatedAt}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, job: result[0] })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))

    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "IDs requis" }, { status: 400 })
    }

    // Check if jobs exist
    const existingJobs = await sql`SELECT id FROM jobs WHERE id = ANY(${ids})`
    if (existingJobs.length !== ids.length) {
      return NextResponse.json({ error: "Une ou plusieurs offres non trouvées" }, { status: 404 })
    }

    // Delete associated applications first
    await sql`DELETE FROM applications WHERE "jobId" = ANY(${ids})`

    // Delete the jobs
    const result = await sql`DELETE FROM jobs WHERE id = ANY(${ids}) RETURNING id`

    return NextResponse.json({
      success: true,
      deletedCount: result.length,
      message: `${result.length} offre(s) supprimée(s)`
    })
  } catch (error) {
    console.error("Error deleting jobs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
