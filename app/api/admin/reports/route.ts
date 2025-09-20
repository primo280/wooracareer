import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'

    let reportData

    switch (reportType) {
      case 'jobs':
        reportData = await sql`
          SELECT
            j.*,
            COUNT(a.id) as application_count
          FROM jobs j
          LEFT JOIN applications a ON j.id = a."jobId"
          GROUP BY j.id
          ORDER BY j."createdAt" DESC
        `.catch(() => [])
        break

      case 'applications':
        reportData = await sql`
          SELECT
            a.*,
            j.title as job_title,
            c."firstName" || ' ' || c."lastName" as candidate_name,
            u.email as candidate_email
          FROM applications a
          JOIN jobs j ON a."jobId" = j.id
          JOIN candidates c ON a."candidateId" = c.id
          JOIN users_sync u ON c."userId" = u.id
          ORDER BY a."appliedAt" DESC
        `.catch(() => [])
        break

      case 'users':
        reportData = await sql`
          SELECT
            u.*,
            COUNT(DISTINCT c.id) as candidate_count,
            COUNT(DISTINCT j.id) as job_count
          FROM users_sync u
          LEFT JOIN candidates c ON u.id = c."userId"
          LEFT JOIN jobs j ON u.id = j."createdBy"
          GROUP BY u.id
          ORDER BY u."createdAt" DESC
        `.catch(() => [])
        break

      default: // overview
        reportData = await sql`
          SELECT
            'overview' as type,
            json_build_object(
              'total_jobs', COALESCE((SELECT COUNT(*) FROM jobs), 0),
              'active_jobs', COALESCE((SELECT COUNT(*) FROM jobs WHERE status = 'active'), 0),
              'total_applications', COALESCE((SELECT COUNT(*) FROM applications), 0),
              'pending_applications', COALESCE((SELECT COUNT(*) FROM applications WHERE status = 'pending'), 0),
              'total_users', COALESCE((SELECT COUNT(*) FROM users_sync), 0),
              'total_candidates', COALESCE((SELECT COUNT(*) FROM candidates), 0)
            ) as data
        `.catch(() => [{
          type: 'overview',
          data: {
            total_jobs: 0,
            active_jobs: 0,
            total_applications: 0,
            pending_applications: 0,
            total_users: 0,
            total_candidates: 0
          }
        }])
    }

    return NextResponse.json({
      reportType,
      data: reportData,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Error generating admin report:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { reportType, dateRange, filters } = body

    if (!reportType) {
      return NextResponse.json(
        { error: "Type de rapport requis" },
        { status: 400 }
      )
    }

    // For now, we'll just return success
    // You can implement actual report generation here
    const report = {
      id: Date.now(),
      reportType,
      dateRange: dateRange || 'all',
      filters: filters || {},
      status: 'generated',
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error("Error generating custom report:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
