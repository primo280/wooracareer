import { NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET() {
  try {
    // Get total jobs count
    const totalJobsResult = await sql`SELECT COUNT(*) as count FROM jobs`
    const totalJobs = Number(totalJobsResult[0].count)

    // Get active jobs count
    const activeJobsResult = await sql`SELECT COUNT(*) as count FROM jobs WHERE status = 'active'`
    const activeJobs = Number(activeJobsResult[0].count)

    // Get total applications count
    const totalApplicationsResult = await sql`SELECT COUNT(*) as count FROM applications`
    const totalApplications = Number(totalApplicationsResult[0].count)

    // Get pending applications count
    const pendingApplicationsResult = await sql`SELECT COUNT(*) as count FROM applications WHERE status = 'pending'`
    const pendingApplications = Number(pendingApplicationsResult[0].count)

    // Get total views count
    const totalViewsResult = await sql`SELECT COALESCE(SUM("viewsCount"), 0) as total FROM jobs`
    const totalViews = Number(totalViewsResult[0].total)

    // Get recent jobs (last 5)
    const recentJobsResult = await sql`
      SELECT id, title, company, status, "createdAt"
      FROM jobs
      ORDER BY "createdAt" DESC
      LIMIT 5
    `

    // Get recent applications (last 5)
    const recentApplicationsResult = await sql`
      SELECT
        a.id,
        a."jobId",
        j.title as job_title,
        CONCAT(c."firstName", ' ', c."lastName") as candidate_name,
        u.email as candidate_email,
        a.status,
        a."appliedAt" as applied_at
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      JOIN candidates c ON a."candidateId" = c.id
      JOIN users_sync u ON c."userId" = u.id
      ORDER BY a."appliedAt" DESC
      LIMIT 5
    `

    // Get jobs by status
    const jobsByStatusResult = await sql`
      SELECT status, COUNT(*) as count
      FROM jobs
      GROUP BY status
      ORDER BY count DESC
    `

    // Get applications by status
    const applicationsByStatusResult = await sql`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
      ORDER BY count DESC
    `

    // Get recent activity (jobs and applications from last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivityResult = await sql`
      SELECT
        'job' as type,
        title,
        "createdAt" as date
      FROM jobs
      WHERE "createdAt" >= ${thirtyDaysAgo.toISOString()}
      UNION ALL
      SELECT
        'application' as type,
        j.title,
        a."appliedAt" as date
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."appliedAt" >= ${thirtyDaysAgo.toISOString()}
      ORDER BY date DESC
      LIMIT 20
    `

    // Get total users and candidates (placeholder values for now)
    const totalUsers = 0
    const totalCandidates = 0
    const totalNotifications = 0
    const unreadNotifications = 0

    return NextResponse.json({
      success: true,
      overview: {
        total_jobs: totalJobs,
        active_jobs: activeJobs,
        total_applications: totalApplications,
        pending_applications: pendingApplications,
        total_views: totalViews,
        total_users: totalUsers,
        total_candidates: totalCandidates,
        total_notifications: totalNotifications,
        unread_notifications: unreadNotifications,
      },
      jobsByStatus: jobsByStatusResult,
      applicationsByStatus: applicationsByStatusResult,
      recentActivity: recentActivityResult,
      recentJobs: recentJobsResult,
      recentApplications: recentApplicationsResult,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
