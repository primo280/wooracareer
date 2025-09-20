import { type NextRequest, NextResponse } from "next/server"
import { sql, getJobs, getJobsCount } from "../../../lib/database"
import { jobFiltersSchema, type JobFiltersInput } from "../admin/jobs/schema"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const offset = (page - 1) * limit

    const filters = {
      search: searchParams.get("search") || undefined,
      location: searchParams.get("location") || undefined,
      type: (searchParams.get("type") as "CDI" | "CDD" | "Stage" | "Freelance") || undefined,
      salaryMin: searchParams.get("salary_min") || undefined,
    }

    // Validate filters
    const validationResult = jobFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return NextResponse.json(
        {
          error: "Paramètres de recherche invalides",
          details: errors,
          code: "VALIDATION_ERROR"
        },
        { status: 400 }
      )
    }

    const validFilters: JobFiltersInput = validationResult.data

    // Get jobs with pagination
    const jobs = await getJobs({
      search: validFilters.search,
      location: validFilters.location,
      type: validFilters.type,
    }, limit, offset)

    // Get total count for pagination metadata
    const totalCount = await getJobsCount({
      search: validFilters.search,
      location: validFilters.location,
      type: validFilters.type,
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des offres d'emploi",
        code: "SERVER_ERROR"
      },
      { status: 500 }
    )
  }
}
