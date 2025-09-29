import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = Number.parseInt(params.id)

    // Validate job ID
    if (isNaN(jobId) || jobId <= 0) {
      return NextResponse.json(
        {
          error: "ID d'offre invalide",
          code: "INVALID_ID"
        },
        { status: 400 }
      )
    }

    // Get job details with proper field mapping
    const jobResult = await sql`
      SELECT
        id,
        title,
        company,
        location,
        type,
        "salaryMin",
        "salaryMax",
        currency,
        description,
        requirements,
        benefits,
        "remoteWork",
        "experienceLevel",
        "contractDuration",
        "applicationUrl",
        "applicationEmail",
        "companyLogo",
        "companyWebsite",
        "jobImage",
        "jobPdf",
        tags,
        featured,
        status,
        "createdAt",
        "updatedAt",
        "expiresAt",
        "createdBy",
        "viewsCount"
      FROM jobs
      WHERE id = ${jobId} AND status = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
    `

    if (jobResult.length === 0) {
      return NextResponse.json(
        {
          error: "Offre d'emploi non trouvée",
          code: "JOB_NOT_FOUND"
        },
        { status: 404 }
      )
    }

    const job = {
      ...jobResult[0],
      salaryMin: jobResult[0].salaryMin || undefined,
      salaryMax: jobResult[0].salaryMax || undefined,
      tags: jobResult[0].tags || [],
      createdAt: jobResult[0].createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: jobResult[0].updatedAt?.toISOString() || new Date().toISOString(),
      expiresAt: jobResult[0].expiresAt?.toISOString() || undefined,
    }

    // Increment view count asynchronously (don't wait for it to avoid blocking response)
    sql`
      UPDATE jobs SET "viewsCount" = "viewsCount" + 1 WHERE id = ${jobId}
    `.catch(error => {
      console.error("Error incrementing view count:", error)
    })

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'offre d'emploi",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    )
  }
}
